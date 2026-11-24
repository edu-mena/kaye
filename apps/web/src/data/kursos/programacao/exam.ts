import type { ExamQuestion, UnitContent } from '../types'

// The final exam's bank: the three questions of each written topic's review (20 are drawn each attempt,
// domain/kursos.ts). It grows by itself with each topic file, so the exam only asks what is written.

const TOPIC_FILES = import.meta.glob<{ default: UnitContent }>('./t[0-9][0-9].ts')

export default async function loadExam(): Promise<ExamQuestion[]> {
  const entries = await Promise.all(
    Object.entries(TOPIC_FILES).map(async ([path, load]) => ({
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
