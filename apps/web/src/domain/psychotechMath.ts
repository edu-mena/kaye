// The quantitative part of the psychotechnical practice: geometry, proportions, percentages and chance.
// Every number comes from the seed and the right answer is computed here, never typed by hand; the wrong
// options are the usual slips (forgetting a step, mixing area with perimeter). The wording lives in the
// locales (psychotech.math_<topic>), so a topic only carries its numbers.

type Random = () => number

export const MATH_TOPICS = {
  easy: ['rectArea', 'rectPerimeter', 'percentOf', 'ruleOfThree', 'triangleAngle', 'average'],
  medium: [
    'pythagoras',
    'polygonAngles',
    'discount',
    'speed',
    'cubeVolume',
    'marbles',
    'squareFromPerimeter',
  ],
  hard: [
    'lShape',
    'diagonal',
    'successivePercent',
    'similar',
    'arrangements',
    'workTogether',
    'trapezoid',
    'twoDraws',
  ],
} as const

export type MathLevel = keyof typeof MATH_TOPICS
export type MathTopic = (typeof MATH_TOPICS)[MathLevel][number]

/** What is drawn next to the question (an aid: the text always says the numbers too). */
export type Diagram =
  | { kind: 'rect'; w: number; h: number }
  | { kind: 'rightTriangle'; a: number; b: number }
  | { kind: 'lShape'; w: number; h: number; cw: number; ch: number }
  | { kind: 'trapezoid'; top: number; bottom: number; height: number }
  | { kind: 'cube'; edge: number }

export type MathItem = {
  topic: MathTopic
  params: Record<string, number | string>
  diagram?: Diagram
  correct: string
  /** Slips, most tempting first; the caller keeps three that differ from `correct`. */
  wrong: string[]
}

const int = (random: Random, min: number, max: number) => min + Math.floor(random() * (max - min + 1))
const pick = <T>(random: Random, list: readonly T[]): T => list[Math.floor(random() * list.length)] as T

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
/** 6/8 â†’ "3/4"; a whole number stays whole. */
export function fraction(top: number, bottom: number): string {
  const divisor = gcd(top, bottom)
  const [n, d] = [top / divisor, bottom / divisor]
  return d === 1 ? String(n) : `${n}/${d}`
}

/** 2.5 â†’ "2,5": the decimal comma of Portuguese and French; plain digits otherwise. */
const num = (value: number) => String(Math.round(value * 100) / 100).replace('.', ',')

/** Right-angled triangles with whole sides, so the hypotenuse is a whole number. */
const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
]

type Maker = (random: Random) => MathItem

const MAKERS: Record<MathTopic, Maker> = {
  rectArea(random) {
    const [w, h] = [int(random, 4, 14), int(random, 3, 12)]
    return {
      topic: 'rectArea',
      params: { w, h },
      diagram: { kind: 'rect', w, h },
      correct: `${w * h} cmÂ²`,
      wrong: [`${2 * (w + h)} cmÂ²`, `${w + h} cmÂ²`, `${w * h + w} cmÂ²`, `${w * h - h} cmÂ²`],
    }
  },
  rectPerimeter(random) {
    const [w, h] = [int(random, 4, 14), int(random, 3, 12)]
    return {
      topic: 'rectPerimeter',
      params: { w, h },
      diagram: { kind: 'rect', w, h },
      correct: `${2 * (w + h)} cm`,
      wrong: [`${w * h} cm`, `${w + h} cm`, `${2 * w + h} cm`, `${2 * (w + h) + 2} cm`],
    }
  },
  percentOf(random) {
    const percent = pick(random, [10, 20, 25, 30, 40, 50, 60, 75])
    const total = int(random, 4, 40) * 20
    const right = (total * percent) / 100
    return {
      topic: 'percentOf',
      params: { percent, total },
      correct: String(right),
      wrong: [
        String(total - right),
        String(right * 2),
        String(total / percent),
        String(right + 10),
        String(right / 2),
        String(right - 10),
      ],
    }
  },
  ruleOfThree(random) {
    const [a, b, k] = [int(random, 2, 6), int(random, 3, 9), int(random, 2, 5)]
    const unit = b * 10
    return {
      topic: 'ruleOfThree',
      params: { a, cost: a * unit, b: a * k },
      correct: String(k * a * unit),
      wrong: [String(unit * k), String(a * unit + k), String(a * unit * k * 2), String(a * unit + a * k)],
    }
  },
  triangleAngle(random) {
    const [a, b] = [int(random, 30, 80), int(random, 25, 70)]
    return {
      topic: 'triangleAngle',
      params: { a, b },
      correct: `${180 - a - b}Â°`,
      wrong: [`${360 - a - b}Â°`, `${90 - a}Â°`, `${180 - a}Â°`, `${a + b}Â°`],
    }
  },
  average(random) {
    const mean = int(random, 8, 16)
    const [x, y] = [int(random, 2, 6), int(random, 2, 6)]
    const values = [mean - x, mean + y, mean + x, mean - y, mean]
    const total = values.reduce((sum, value) => sum + value, 0)
    return {
      topic: 'average',
      params: { values: values.join(', ') },
      correct: String(total / 5),
      wrong: [String(total / 4), String(total / 5 + 1), String(Math.max(...values)), String(total / 5 - 1)],
    }
  },
  pythagoras(random) {
    const [a, b, c] = pick(random, TRIPLES)
    const scale = int(random, 1, 3)
    const [x, y, z] = [a * scale, b * scale, c * scale]
    return {
      topic: 'pythagoras',
      params: { a: x, b: y },
      diagram: { kind: 'rightTriangle', a: x, b: y },
      correct: `${z} cm`,
      wrong: [`${x + y} cm`, `${z + 1} cm`, `${Math.abs(y - x)} cm`, `${z - 1} cm`],
    }
  },
  polygonAngles(random) {
    const sides = int(random, 5, 9)
    return {
      topic: 'polygonAngles',
      params: { sides },
      correct: `${(sides - 2) * 180}Â°`,
      wrong: [`${sides * 180}Â°`, `${(sides - 1) * 180}Â°`, `${(sides - 2) * 90}Â°`, `${360}Â°`],
    }
  },
  discount(random) {
    const percent = pick(random, [10, 20, 25, 30, 40])
    const price = int(random, 5, 40) * 200
    const final = (price * (100 - percent)) / 100
    return {
      topic: 'discount',
      params: { price, percent },
      correct: `${final} Kz`,
      wrong: [
        `${(price * percent) / 100} Kz`,
        `${price - percent} Kz`,
        `${(price * (100 + percent)) / 100} Kz`,
        `${final + 100} Kz`,
      ],
    }
  },
  speed(random) {
    const speed = pick(random, [40, 45, 60, 72, 80, 90])
    const minutes = pick(random, [20, 30, 40, 45, 90])
    const km = (speed * minutes) / 60
    return {
      topic: 'speed',
      params: { speed, minutes },
      correct: `${num(km)} km`,
      wrong: [
        `${num(speed * minutes)} km`,
        `${num(speed / minutes)} km`,
        `${num(km + 5)} km`,
        `${num(km * 2)} km`,
      ],
    }
  },
  cubeVolume(random) {
    const edge = int(random, 2, 9)
    return {
      topic: 'cubeVolume',
      params: { edge },
      diagram: { kind: 'cube', edge },
      correct: `${edge ** 3} cmÂ³`,
      wrong: [`${edge ** 2 * 6} cmÂ³`, `${edge ** 2} cmÂ³`, `${edge * 3} cmÂ³`, `${edge ** 3 + edge} cmÂ³`],
    }
  },
  marbles(random) {
    const [red, blue, green] = [int(random, 2, 7), int(random, 2, 7), int(random, 1, 6)]
    const total = red + blue + green
    return {
      topic: 'marbles',
      params: { red, blue, green },
      correct: fraction(red, total),
      wrong: [
        fraction(red, blue + green),
        fraction(blue, total),
        fraction(red + blue, total),
        fraction(blue + green, total),
        fraction(green, total),
        fraction(1, red),
        fraction(red + 1, total),
        fraction(red, total + 1),
      ],
    }
  },
  squareFromPerimeter(random) {
    const side = int(random, 3, 15)
    return {
      topic: 'squareFromPerimeter',
      params: { perimeter: side * 4 },
      diagram: { kind: 'rect', w: side, h: side },
      correct: `${side ** 2} cmÂ²`,
      wrong: [`${side * 4} cmÂ²`, `${(side * 4) ** 2} cmÂ²`, `${side * 2} cmÂ²`, `${side ** 2 + side} cmÂ²`],
    }
  },
  lShape(random) {
    const [w, h] = [int(random, 8, 14), int(random, 7, 12)]
    const [cw, ch] = [int(random, 2, w - 4), int(random, 2, h - 4)]
    return {
      topic: 'lShape',
      params: { w, h, cw, ch },
      diagram: { kind: 'lShape', w, h, cw, ch },
      correct: `${w * h - cw * ch} cmÂ²`,
      wrong: [
        `${w * h} cmÂ²`,
        `${w * h + cw * ch} cmÂ²`,
        `${2 * (w + h)} cmÂ²`,
        `${(w - cw) * (h - ch)} cmÂ²`,
      ],
    }
  },
  diagonal(random) {
    const [a, b, c] = pick(random, TRIPLES)
    const scale = int(random, 1, 2)
    return {
      topic: 'diagonal',
      params: { w: a * scale, h: b * scale },
      diagram: { kind: 'rect', w: a * scale, h: b * scale },
      correct: `${c * scale} cm`,
      wrong: [
        `${(a + b) * scale} cm`,
        `${c * scale + 2} cm`,
        `${a * b * scale * scale} cm`,
        `${c * scale - 1} cm`,
      ],
    }
  },
  successivePercent(random) {
    const percent = pick(random, [10, 20, 25, 30, 50])
    const price = 1000
    const final = (price * (100 + percent) * (100 - percent)) / 10000
    return {
      topic: 'successivePercent',
      params: { percent },
      correct: `${final} Kz`,
      // The start price, the raised price, the lowered price, and two near misses.
      wrong: [
        `${price} Kz`,
        `${(price * (100 + percent)) / 100} Kz`,
        `${(price * (100 - percent)) / 100} Kz`,
        `${final + percent} Kz`,
        `${final - percent} Kz`,
      ],
    }
  },
  similar(random) {
    const [a, b] = pick(random, [
      [3, 4],
      [6, 8],
      [5, 10],
    ] as const)
    const k = int(random, 2, 4)
    return {
      topic: 'similar',
      params: { a, b, k, big: a * k },
      correct: `${b * k} m`,
      wrong: [`${b + k} m`, `${b * k + a} m`, `${a * k * k} m`, `${b * (k + 1)} m`],
    }
  },
  arrangements(random) {
    const people = int(random, 5, 9)
    return {
      topic: 'arrangements',
      params: { people },
      correct: String(people * (people - 1)),
      wrong: [
        String((people * (people - 1)) / 2),
        String(people * people),
        String(people * 2),
        String(people ** 2 - people * 2),
      ],
    }
  },
  workTogether(random) {
    // Two workers finish a job alone in x and y days; together it takes xy/(x+y), whole for these pairs.
    const [x, y] = pick(random, [
      [12, 6],
      [10, 15],
      [20, 30],
      [6, 3],
      [12, 4],
      [30, 20],
    ] as const)
    const together = (x * y) / (x + y)
    return {
      topic: 'workTogether',
      params: { x, y },
      correct: `${together}`,
      wrong: [`${(x + y) / 2}`, `${x + y}`, `${Math.min(x, y)}`, `${together + 2}`].filter(
        (v) => v !== `${together}`,
      ),
    }
  },
  trapezoid(random) {
    const [top, height] = [int(random, 3, 8), int(random, 3, 9)]
    const bottom = top + 2 * int(random, 1, 4)
    return {
      topic: 'trapezoid',
      params: { top, bottom, height },
      diagram: { kind: 'trapezoid', top, bottom, height },
      correct: `${((top + bottom) * height) / 2} cmÂ²`,
      wrong: [
        `${(top + bottom) * height} cmÂ²`,
        `${top * bottom} cmÂ²`,
        `${((top + bottom) * height) / 2 + height} cmÂ²`,
        `${top * height} cmÂ²`,
      ],
    }
  },
  twoDraws(random) {
    const [red, blue] = [int(random, 3, 6), int(random, 2, 5)]
    const total = red + blue
    return {
      topic: 'twoDraws',
      params: { red, blue },
      correct: fraction(red * (red - 1), total * (total - 1)),
      wrong: [
        fraction(red * red, total * total),
        fraction(red, total),
        fraction(2 * red, total * (total - 1)),
        fraction(red * (red - 1), total * total),
      ],
    }
  },
}

/** One quantitative item of the level, from the seed. */
export function mathItem(random: Random, level: MathLevel): MathItem {
  return MAKERS[pick(random, MATH_TOPICS[level])](random)
}

/** Used by the tests: one item of a given topic. */
export const mathItemOf = (random: Random, topic: MathTopic): MathItem => MAKERS[topic](random)
