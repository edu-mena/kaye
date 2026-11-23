import {
  GROUP_AREAS,
  type CareerSummary,
  type CvData,
  type CvEntry,
  type CvExample,
  type MarketArea,
} from '../data/types'

// What a person with no experience can still write on a CV for a career. It comes from the model CVs of
// that career (fictional people written by the team) and, failing that, from the models of its area:
// the skills they list and the projects they describe. Nothing here is the person's own data.

export type CareerTips = {
  /** The skills the models of this career list, the most repeated first. */
  skills: string[]
  /** Projects and first jobs from the models, as ready entries without the place. */
  entries: (Pick<CvEntry, 'title' | 'description'> & { field: 'experience' | 'projects' })[]
  /** The model whose sections fill the preview, faded, while the person's own are empty. */
  sample: CvData | null
}

const SENIORITY = { primeiro_emprego: 0, junior: 1, experiente: 2 }

const byLevel = (list: CvExample[]) =>
  list.toSorted((a, b) => SENIORITY[a.seniority] - SENIORITY[b.seniority])

const same = (first: string, second: string) => first.trim().toLowerCase() === second.trim().toLowerCase()

/** The models for this career, then for its area, the closest to a first job first. */
function relevant(
  examples: CvExample[],
  careers: CareerSummary[],
  slug: string | null,
  area: MarketArea | null,
): CvExample[] {
  const areaOf = (example: CvExample) => {
    const group = careers.find((career) => career.slug === example.careerSlug)?.group
    return group ? GROUP_AREAS[group] : null
  }
  const own = examples.filter((example) => slug && example.careerSlug === slug)
  const targetArea = area ?? (slug ? (areaOf(own[0] ?? ({ careerSlug: slug } as CvExample)) ?? null) : null)
  const sameArea = examples.filter(
    (example) => !own.includes(example) && targetArea && areaOf(example) === targetArea,
  )
  return [...byLevel(own), ...byLevel(sameArea)]
}

/** With no career or area known, the model closest to a first job still shows how a full CV looks. */
const first = (examples: CvExample[]) =>
  examples.toSorted((a, b) => SENIORITY[a.seniority] - SENIORITY[b.seniority])[0]

export function careerTips(
  examples: CvExample[],
  careers: CareerSummary[],
  slug: string | null,
  area: MarketArea | null,
  cv: CvData,
): CareerTips {
  const models = relevant(examples, careers, slug, area)
  const counts = new Map<string, number>()
  for (const model of models)
    for (const skill of model.cv.skills) counts.set(skill, (counts.get(skill) ?? 0) + 1)
  const skills = [...counts.entries()]
    .toSorted((a, b) => b[1] - a[1])
    .map(([skill]) => skill)
    .filter((skill) => !cv.skills.some((have) => same(have, skill)))

  const entries = models
    .flatMap((model) => [
      ...model.cv.projects.map((entry) => ({ ...entry, field: 'projects' as const })),
      ...model.cv.experience.map((entry) => ({ ...entry, field: 'experience' as const })),
    ])
    .filter((entry) => entry.title && entry.description)
    .map(({ title, description, field }) => ({ title, description, field }))
    .filter((entry, index, all) => all.findIndex((other) => same(other.title, entry.title)) === index)
    .filter((entry) => ![...cv.experience, ...cv.projects].some((have) => same(have.title, entry.title)))

  return { skills, entries, sample: (models[0] ?? first(examples))?.cv ?? null }
}
