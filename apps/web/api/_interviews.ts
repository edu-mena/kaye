import { randomBytes } from 'node:crypto'
import { EMAIL, json, PHONE, redis, tooMany } from './_publicCards.js'

// Interview practice sent for review (value offer, point 2.2.1). The Kayé team reads the list
// `interviews` and contacts the person; there is no review page and no result in the app yet.
// Production is Hostinger: this contract moves to Laravel and MySQL like the public pages.

const MAX_BODY = 60_000
const MAX_ANSWER = 4_000
const MAX_ANSWERS = 12
const MAX_KEPT = 5_000
const SENDS_PER_HOUR = 6
const AREA = /^[a-z_]{2,30}$/
const LOCALE = /^(pt|en|fr)$/
const YEAR = /^\d{4}$/

type Answer = { questionId: string; question: string; answer: string; seconds: number; dictated: boolean }

const text = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.trim() !== '' && value.length <= max
const optional = (value: unknown, max: number): value is string | undefined =>
  value === undefined || (typeof value === 'string' && value.length <= max)

function cleanAnswer(input: unknown): Answer | null {
  if (typeof input !== 'object' || input === null) return null
  const { questionId, question, answer, seconds, dictated } = input as Record<string, unknown>
  if (
    !text(questionId, 40) ||
    !text(question, 300) ||
    typeof answer !== 'string' ||
    answer.length > MAX_ANSWER
  )
    return null
  if (typeof seconds !== 'number' || seconds < 0 || seconds > 600 || typeof dictated !== 'boolean')
    return null
  return { questionId, question, answer, seconds: Math.round(seconds), dictated }
}

/** The profession, when the interview was built from one: undefined if absent, null if invalid. */
function cleanCareer(input: unknown): { slug: string; name: string } | undefined | null {
  if (input === undefined) return undefined
  if (typeof input !== 'object' || input === null) return null
  const { slug, name } = input as Record<string, unknown>
  return text(slug, 120) && /^[a-z0-9-]+$/.test(slug) && text(name, 120) ? { slug, name } : null
}

/** The submission if every field is valid; null otherwise. Unknown fields are dropped. */
function clean(input: unknown) {
  if (typeof input !== 'object' || input === null) return null
  const { area, career, locale, startedAt, candidate, answers } = input as Record<string, unknown>
  if (!text(area, 30) || !AREA.test(area) || !text(locale, 2) || !LOCALE.test(locale)) return null
  if (!text(startedAt, 40) || Number.isNaN(Date.parse(startedAt))) return null
  const profession = cleanCareer(career)
  if (profession === null) return null
  if (typeof candidate !== 'object' || candidate === null) return null
  const { name, birthYear, province, education, contact, guardianInformed } = candidate as Record<
    string,
    unknown
  >
  if (
    !text(name, 80) ||
    !text(contact, 120) ||
    !(EMAIL.test(contact) || PHONE.test(contact.replace(/[\s-]/g, '')))
  )
    return null
  if (typeof birthYear !== 'number' || !YEAR.test(String(birthYear))) return null
  if (!optional(province, 60) || !optional(education, 40) || typeof guardianInformed !== 'boolean')
    return null
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > MAX_ANSWERS) return null
  const cleaned = answers.map(cleanAnswer)
  if (cleaned.some((answer) => answer === null)) return null
  return {
    area,
    ...(profession ? { career: profession } : {}),
    locale,
    startedAt,
    candidate: {
      name: name.trim(),
      birthYear,
      province,
      education,
      contact: contact.trim(),
      guardianInformed,
    },
    answers: cleaned as Answer[],
  }
}

export async function createInterview(request: Request): Promise<Response> {
  if (await tooMany(request, SENDS_PER_HOUR, 'interviews')) return json({ error: 'too_many' }, 429)
  const body = await request.text()
  if (body.length > MAX_BODY) return json({ error: 'invalid' }, 422)
  let interview: ReturnType<typeof clean>
  try {
    interview = clean(JSON.parse(body))
  } catch {
    interview = null
  }
  if (!interview) return json({ error: 'invalid' }, 422)
  const id = randomBytes(9).toString('base64url')
  const stored = { id, receivedAt: new Date().toISOString(), status: 'pending', ...interview }
  await redis(['LPUSH', 'interviews', JSON.stringify(stored)])
  await redis(['LTRIM', 'interviews', 0, MAX_KEPT - 1])
  return json({ id }, 201)
}
