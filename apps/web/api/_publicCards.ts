import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

// The public pages on the test site (docs/decisoes/0014). Production is Hostinger: this contract
// moves to Laravel and MySQL, and the app changes nothing but its base URL.

const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

const MAX_BODY = 200_000
const MAX_PHOTO = 120_000
const WRITES_PER_HOUR = 30
const SLUG = /^[A-Za-z0-9_-]{12}$/
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const COLOR = /^#[0-9a-f]{6}$/i
export const PHONE = /^\+?\d{7,16}$/
const PHOTO = /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/

type Stored = { card: Record<string, string>; secretHash: string }

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // Deactivating must work at once: nothing may keep an old copy.
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

export async function redis<T>(command: (string | number)[]): Promise<T> {
  if (!REDIS_URL || !REDIS_TOKEN) throw new Error('storage is not configured')
  const response = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  })
  if (!response.ok) throw new Error(`storage answered ${response.status}`)
  return ((await response.json()) as { result: T }).result
}

const key = (slug: string) => `card:${slug}`
const hash = (secret: string) => createHash('sha256').update(secret).digest()

function isLink(value: string): boolean {
  try {
    const { protocol } = new URL(value)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

type Rule = (value: string) => boolean
const under =
  (max: number, test: Rule = () => true): Rule =>
  (value) =>
    value.length <= max && test(value)

/** Only these fields are ever kept: anything else in a request is dropped. */
const RULES: Record<string, Rule> = {
  name: under(80, (value) => value.trim() !== ''),
  accent: (value) => COLOR.test(value),
  headline: under(120),
  photo: under(MAX_PHOTO, (value) => PHOTO.test(value)),
  email: under(120, (value) => EMAIL.test(value)),
  whatsapp: (value) => PHONE.test(value),
  linkedin: under(200, isLink),
  portfolio: under(200, isLink),
}

/** The card if every field is valid; null otherwise. */
function clean(input: unknown): Record<string, string> | null {
  if (typeof input !== 'object' || input === null) return null
  const card: Record<string, string> = {}
  for (const [field, rule] of Object.entries(RULES)) {
    const value = (input as Record<string, unknown>)[field]
    if (value === undefined) continue
    if (typeof value !== 'string' || !rule(value)) return null
    card[field] = value
  }
  return card.name && card.accent ? card : null
}

/** Counts the writes of one address per hour; `scope` keeps each endpoint's count apart. */
export async function tooMany(request: Request, limit = WRITES_PER_HOUR, scope = 'rate'): Promise<boolean> {
  const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for') ?? 'unknown'
  const counter = `${scope}:${ip}`
  const hits = await redis<number>(['INCR', counter])
  if (hits === 1) await redis(['EXPIRE', counter, 3600])
  return hits > limit
}

async function readCard(request: Request): Promise<Record<string, string> | null> {
  const text = await request.text()
  if (text.length > MAX_BODY) return null
  try {
    return clean(JSON.parse(text))
  } catch {
    return null
  }
}

async function load(slug: string): Promise<Stored | null> {
  if (!SLUG.test(slug)) return null
  const value = await redis<string | null>(['GET', key(slug)])
  return value ? (JSON.parse(value) as Stored) : null
}

function owns(stored: Stored, request: Request): boolean {
  const secret = (request.headers.get('authorization') ?? '').replace(/^Bearer /, '')
  const expected = Buffer.from(stored.secretHash, 'hex')
  return secret !== '' && timingSafeEqual(hash(secret), expected)
}

/** Answers 503 rather than a stack trace when the storage is down or not connected. */
export async function guarded(work: () => Promise<Response>): Promise<Response> {
  try {
    return await work()
  } catch {
    return json({ error: 'unavailable' }, 503)
  }
}

export async function createCard(request: Request): Promise<Response> {
  if (await tooMany(request)) return json({ error: 'too_many' }, 429)
  const card = await readCard(request)
  if (!card) return json({ error: 'invalid' }, 422)
  const slug = randomBytes(9).toString('base64url')
  const secret = randomBytes(32).toString('base64url')
  const stored: Stored = { card, secretHash: hash(secret).toString('hex') }
  await redis(['SET', key(slug), JSON.stringify(stored)])
  return json({ slug, secret }, 201)
}

export async function showCard(slug: string): Promise<Response> {
  const stored = await load(slug)
  return stored ? json(stored.card) : json({ error: 'not_found' }, 404)
}

export async function replaceCard(slug: string, request: Request): Promise<Response> {
  if (await tooMany(request)) return json({ error: 'too_many' }, 429)
  const stored = await load(slug)
  if (!stored) return json({ error: 'not_found' }, 404)
  if (!owns(stored, request)) return json({ error: 'forbidden' }, 403)
  const card = await readCard(request)
  if (!card) return json({ error: 'invalid' }, 422)
  await redis(['SET', key(slug), JSON.stringify({ ...stored, card })])
  return json(card)
}

export async function removeCard(slug: string, request: Request): Promise<Response> {
  const stored = await load(slug)
  if (!stored) return new Response(null, { status: 204 })
  if (!owns(stored, request)) return json({ error: 'forbidden' }, 403)
  await redis(['DEL', key(slug)])
  return new Response(null, { status: 204 })
}

export const slugOf = (request: Request) => new URL(request.url).pathname.split('/').pop() ?? ''
