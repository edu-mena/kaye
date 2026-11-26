import { describe, expect, it } from 'vitest'
import { buildSession, seeded, SKILLS } from './psychotech'
import { fraction, MATH_TOPICS, mathItemOf, type MathTopic } from './psychotechMath'

const ALL = Object.values(MATH_TOPICS).flat() as MathTopic[]
/** Floating point noise (1819.9999999999998) is not a different answer. */
const clean = (text: string) =>
  text.replace(/-?\d+\.\d+/g, (match) => String(Math.round(Number(match) * 100) / 100))
const SEEDS = Array.from({ length: 300 }, (_, i) => i + 1)

/** A second, independent route to each answer, written from the wording of the question. */
const SOLVE: Record<MathTopic, (p: Record<string, number | string>) => string> = {
  rectArea: (p) => `${Number(p.w) * Number(p.h)} cm²`,
  rectPerimeter: (p) => `${(Number(p.w) + Number(p.h)) * 2} cm`,
  percentOf: (p) => String((Number(p.total) / 100) * Number(p.percent)),
  ruleOfThree: (p) => String((Number(p.cost) / Number(p.a)) * Number(p.b)),
  triangleAngle: (p) => `${180 - Number(p.a) - Number(p.b)}°`,
  average: (p) => {
    const values = String(p.values).split(', ').map(Number)
    return String(values.reduce((sum, value) => sum + value, 0) / values.length)
  },
  pythagoras: (p) => `${Math.hypot(Number(p.a), Number(p.b))} cm`,
  polygonAngles: (p) => `${(Number(p.sides) - 2) * 180}°`,
  discount: (p) => `${Number(p.price) * (1 - Number(p.percent) / 100)} Kz`,
  speed: (p) =>
    `${String((Number(p.speed) * (Number(p.minutes) / 60)).toFixed(2).replace(/\.?0+$/, '')).replace('.', ',')} km`,
  cubeVolume: (p) => `${Number(p.edge) * Number(p.edge) * Number(p.edge)} cm³`,
  marbles: (p) => fraction(Number(p.red), Number(p.red) + Number(p.blue) + Number(p.green)),
  squareFromPerimeter: (p) => `${(Number(p.perimeter) / 4) ** 2} cm²`,
  lShape: (p) =>
    `${(Number(p.w) - Number(p.cw)) * Number(p.ch) + Number(p.w) * (Number(p.h) - Number(p.ch))} cm²`,
  diagonal: (p) => `${Math.hypot(Number(p.w), Number(p.h))} cm`,
  successivePercent: (p) => `${1000 * (1 + Number(p.percent) / 100) * (1 - Number(p.percent) / 100)} Kz`,
  similar: (p) => `${(Number(p.big) / Number(p.a)) * Number(p.b)} m`,
  // Pairs of people, times the two ways of giving them the two roles.
  arrangements: (p) => String(((Number(p.people) * (Number(p.people) - 1)) / 2) * 2),
  workTogether: (p) => String(1 / (1 / Number(p.x) + 1 / Number(p.y))),
  trapezoid: (p) => `${((Number(p.top) + Number(p.bottom)) / 2) * Number(p.height)} cm²`,
  twoDraws: (p) => {
    const [red, total] = [Number(p.red), Number(p.red) + Number(p.blue)]
    return fraction(red * (red - 1), total * (total - 1))
  },
}

describe('quantitative questions', () => {
  it.each(ALL)('%s: the answer matches an independent solution, with three distinct slips', (topic) => {
    for (const seed of SEEDS) {
      const item = mathItemOf(seeded(seed), topic)
      expect(item.correct, `${topic} seed ${seed}`).toBe(clean(SOLVE[topic](item.params)))
      const wrong = new Set(item.wrong.filter((option) => option !== item.correct))
      expect(wrong.size, `${topic} seed ${seed}`).toBeGreaterThanOrEqual(3)
    }
  })

  it('draws the figure of every geometry topic with the numbers of the question', () => {
    const withDiagram = ALL.filter((topic) => mathItemOf(seeded(1), topic).diagram)
    expect(withDiagram).toEqual(
      expect.arrayContaining(['rectArea', 'pythagoras', 'lShape', 'trapezoid', 'cubeVolume']),
    )
  })

  it('keeps the L-shape and the trapezoid valid for every seed', () => {
    for (const seed of SEEDS) {
      const l = mathItemOf(seeded(seed), 'lShape').params
      expect(Number(l.cw)).toBeLessThan(Number(l.w))
      expect(Number(l.ch)).toBeLessThan(Number(l.h))
      const t = mathItemOf(seeded(seed), 'trapezoid').params
      expect(Number(t.bottom)).toBeGreaterThan(Number(t.top))
    }
  })

  it('puts the right option where `answer` points, in every level of a full session', () => {
    for (const level of ['easy', 'medium', 'hard'] as const) {
      for (const seed of [11, 222, 3333]) {
        const questions = buildSession('quantitative', level, seed)
        expect(questions).toHaveLength(10)
        const shown = questions.map((question) => {
          const options = question.options as unknown[]
          const solved = question.kind === 'math' ? clean(SOLVE[question.topic](question.params)) : undefined
          return {
            skill: question.skill,
            count: new Set(options).size,
            right: options[question.answer],
            solved,
          }
        })
        for (const { skill, count, right, solved } of shown) {
          expect(skill).toBe('quantitative')
          expect(count).toBe(4)
          expect(right).toBe(solved)
        }
      }
    }
  })

  it('mixes the six skills equally in the full simulation, with no repeated question', () => {
    const questions = buildSession('full', 'hard', 7)
    expect(questions).toHaveLength(24)
    for (const skill of SKILLS)
      expect(questions.filter((question) => question.skill === skill)).toHaveLength(4)
  })

  it('simplifies fractions and keeps whole numbers whole', () => {
    expect(fraction(6, 8)).toBe('3/4')
    expect(fraction(4, 2)).toBe('2')
    expect(fraction(3, 10)).toBe('3/10')
  })
})
