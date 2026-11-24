import type { ExamQuestion, Unit, UnitContent } from './types'

// Shared by the courses written as topics (docs/decisoes/0025): one topic = one unit with one short lesson.

export type TopicMeta = { id: string; title: string; summary: string }
type Files = Record<string, () => Promise<{ default: UnitContent }>>

/** The roadmap units: a topic without its file yet shows as "Em breve". `files` is an `import.meta.glob`. */
export function topicUnits(dir: string, topics: TopicMeta[], files: Files): Unit[] {
  return topics.map((topic, at) => {
    const load = files[`./${dir}/${topic.id}.ts`]
    const unit: Unit = { id: topic.id, number: at + 1, title: topic.title, summary: topic.summary }
    if (load) {
      unit.load = () => load().then((module) => module.default)
      unit.lessons = [{ id: 'l1', title: topic.title, estimatedMinutes: 5 }]
    }
    return unit
  })
}

/** The exam bank: the three choice questions of each written topic's review, in topic order. */
export async function topicExam(files: Files): Promise<ExamQuestion[]> {
  const entries = await Promise.all(
    Object.entries(files).map(async ([path, load]) => ({
      unit: /t\d\d/.exec(path)?.[0] ?? '',
      content: (await load()).default,
    })),
  )
  return entries
    .toSorted((a, b) => a.unit.localeCompare(b.unit))
    .flatMap(({ unit, content }) =>
      content.review.flatMap((block) =>
        block.kind === 'choice'
          ? block.items.map((item, at): ExamQuestion => ({
              id: `${unit}-q${at + 1}`,
              unit,
              kind: 'choice',
              ...item,
            }))
          : [],
      ),
    )
}
