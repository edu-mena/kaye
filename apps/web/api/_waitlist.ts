import { createHash, timingSafeEqual } from 'node:crypto'
import { EMAIL, json, PHONE, redis, tooMany } from './_publicCards.js'

// Pre-launch: the waiting list and the critiques/ideas sent from the site. The Kayé team downloads
// both as CSV (GET /api/v1/waitlist/export, token WAITLIST_EXPORT_TOKEN). Production is Hostinger:
// this contract moves to Laravel and MySQL like the public pages.

const MAX_BODY = 8_000
const MAX_KEPT = 20_000
const SENDS_PER_HOUR = 10
const LOCALE = /^(pt|en|fr)$/
const KINDS = ['critique', 'idea', 'bug'] as const
const PAGES = ['landing', 'support'] as const
const SOURCES = new Set(['landing', 'onboarding'])

type Kind = (typeof KINDS)[number]
type Page = (typeof PAGES)[number]

const LISTS = { waitlist: 'waitlist', feedback: 'feedback' } as const
const CONTACTS = 'waitlist:contacts'

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const text = await request.text()
  if (text.length > MAX_BODY) return null
  try {
    const value: unknown = JSON.parse(text)
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
  } catch {
    return null
  }
}

const optionalText = (value: unknown, max: number): value is string | undefined =>
  value === undefined || (typeof value === 'string' && value.length <= max)

const lang = (value: unknown) => (typeof value === 'string' && LOCALE.test(value) ? value : 'pt')

/** Bots fill every field; people never see this one. Their request "succeeds" and is dropped. */
const isBot = (body: Record<string, unknown>) => typeof body.website === 'string' && body.website !== ''

/** A WhatsApp number as +244…: accepts spaces and dashes, and adds +244 to a bare Angolan number. */
export function normalisePhone(value: string): string | null {
  const digits = value.replace(/[\s().-]/g, '')
  if (digits === '') return null
  const full = /^9\d{8}$/.test(digits) ? `+244${digits}` : digits.startsWith('+') ? digits : `+${digits}`
  return PHONE.test(full) ? full : null
}

function cleanSignup(body: Record<string, unknown>) {
  const { name, email, whatsapp, consent } = body
  if (consent !== true) return null
  if (!optionalText(name, 80) || !optionalText(email, 120) || !optionalText(whatsapp, 30)) return null
  const mail = email?.trim().toLowerCase() ?? ''
  if (mail !== '' && !EMAIL.test(mail)) return null
  const phone = whatsapp?.trim() ? normalisePhone(whatsapp) : ''
  if (phone === null) return null
  if (mail === '' && phone === '') return null
  const source = typeof body.source === 'string' && SOURCES.has(body.source) ? body.source : 'landing'
  return { name: name?.trim() ?? '', email: mail, whatsapp: phone, source, lang: lang(body.lang) }
}

export async function joinWaitlist(request: Request): Promise<Response> {
  if (await tooMany(request, SENDS_PER_HOUR, 'waitlist')) return json({ error: 'too_many' }, 429)
  const body = await readJson(request)
  if (!body) return json({ error: 'invalid' }, 422)
  if (isBot(body)) return json({ ok: true }, 201)
  const signup = cleanSignup(body)
  if (!signup) return json({ error: 'invalid' }, 422)

  const keys = [
    signup.email && `email:${signup.email}`,
    signup.whatsapp && `phone:${signup.whatsapp}`,
  ].filter(Boolean)
  const known = await Promise.all(keys.map((member) => redis<number>(['SISMEMBER', CONTACTS, member])))
  if (known.some((hit) => hit === 1)) return json({ ok: true, already: true })

  await redis(['RPUSH', LISTS.waitlist, JSON.stringify({ ...signup, date: new Date().toISOString() })])
  await redis(['SADD', CONTACTS, ...keys])
  return json({ ok: true }, 201)
}

function cleanFeedback(body: Record<string, unknown>) {
  const { kind, message, page } = body
  if (typeof kind !== 'string' || !KINDS.includes(kind as Kind)) return null
  if (typeof message !== 'string' || message.trim().length < 3 || message.length > 2000) return null
  const where = typeof page === 'string' && PAGES.includes(page as Page) ? page : 'landing'
  return { kind, message: message.trim(), page: where, lang: lang(body.lang) }
}

export async function sendFeedback(request: Request): Promise<Response> {
  if (await tooMany(request, SENDS_PER_HOUR, 'feedback')) return json({ error: 'too_many' }, 429)
  const body = await readJson(request)
  if (!body) return json({ error: 'invalid' }, 422)
  if (isBot(body)) return json({ ok: true }, 201)
  const feedback = cleanFeedback(body)
  if (!feedback) return json({ error: 'invalid' }, 422)
  await redis(['RPUSH', LISTS.feedback, JSON.stringify({ ...feedback, date: new Date().toISOString() })])
  await redis(['LTRIM', LISTS.feedback, -MAX_KEPT, -1])
  return json({ ok: true }, 201)
}

const digest = (value: string) => createHash('sha256').update(value).digest()

function authorised(request: Request): boolean {
  const expected = process.env.WAITLIST_EXPORT_TOKEN ?? ''
  if (expected.length < 16) return false
  const header =
    request.headers.get('x-export-token') ??
    (request.headers.get('authorization') ?? '').replace(/^Bearer /, '')
  const given = header || (new URL(request.url).searchParams.get('token') ?? '')
  return given !== '' && timingSafeEqual(digest(given), digest(expected))
}

const COLUMNS = {
  waitlist: ['date', 'source', 'name', 'email', 'whatsapp', 'lang'],
  feedback: ['date', 'kind', 'page', 'lang', 'message'],
} as const

/** One CSV cell; a leading = + - @ is neutralised so a spreadsheet never runs it as a formula. */
function cell(value: unknown): string {
  let text = typeof value === 'string' ? value : value === undefined || value === null ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text) && !PHONE.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export async function exportList(request: Request): Promise<Response> {
  if (!authorised(request)) return json({ error: 'unauthorised' }, 401)
  const kind = new URL(request.url).searchParams.get('kind') ?? 'waitlist'
  if (kind !== 'waitlist' && kind !== 'feedback') return json({ error: 'invalid' }, 422)
  const rows = await redis<string[]>(['LRANGE', LISTS[kind], 0, -1])
  const columns = COLUMNS[kind]
  const lines = rows.map((row) => {
    const item = JSON.parse(row) as Record<string, unknown>
    return columns.map((column) => cell(item[column])).join(',')
  })
  const csv = `﻿${[columns.join(','), ...lines].join('\r\n')}\r\n`
  const day = new Date().toISOString().slice(0, 10)
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="kaye-${kind}-${day}.csv"`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
