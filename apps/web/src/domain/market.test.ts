import { describe, expect, it } from 'vitest'
import type { EducationStats, JobMarket } from '../data/types'
import { areaShares, marketSummary } from './market'

const jobs = {
  areas: [
    { area: 'technology', postings: 30 },
    { area: 'education', postings: 10 },
    { area: 'health', postings: 60 },
    { area: 'other', postings: 500 },
  ],
  asks: {
    experience: [
      { band: 'none', postings: 20 },
      { band: 'mid', postings: 80 },
    ],
  },
  careers: [{ slug: 'analista-de-dados', postings: 12 }],
  public: { competitions: 4, openings: 900, areas: [{ area: 'education', competitions: 3, openings: 900 }] },
} as unknown as JobMarket
const education = {
  year: '2023/24',
  total: 1000,
  access: { candidates: 9000, firstTime: 3000, enrolled: 8000 },
  areas: [
    {
      area: 'technology',
      graduates: 100,
      enrolled: 2000,
      courses: [{ name: 'Informática', graduates: 100 }],
    },
    { area: 'education', graduates: 600, courses: [{ name: 'Pedagogia', graduates: 600 }] },
    { area: 'health', graduates: 300, courses: [{ name: 'Enfermagem', graduates: 300 }] },
    { area: 'legal', graduates: 0, courses: [] },
  ],
} as unknown as EducationStats

describe('areaShares', () => {
  const rows = areaShares(jobs, education)

  it('puts each area’s share of the posts (without the unknown ones) next to its share of graduates', () => {
    expect(rows.map((row) => row.area)).toEqual(['health', 'technology', 'education'])
    expect(rows[0]).toMatchObject({ postings: 60, postingsShare: 0.6, graduates: 300, graduatesShare: 0.3 })
    expect(rows[1]).toMatchObject({ area: 'technology', enrolled: 2000, enrolledShare: 0.25 })
    expect(rows[2]).toMatchObject({
      postingsShare: 0.1,
      publicOpenings: 900,
      publicShare: 1,
      graduatesShare: 0.6,
    })
  })

  it('leaves out the areas with neither posts nor graduates', () => {
    expect(rows.some((row) => row.area === 'legal')).toBe(false)
  })
})

describe('marketSummary', () => {
  it('reads the top province, area, course and tech career, and the public competitions', () => {
    expect(marketSummary(jobs, education)).toEqual({
      noExperience: 0.2,
      area: { area: 'health', share: 0.6 },
      publicCompetitions: { competitions: 4, openings: 900 },
      graduates: { year: '2023/24', total: 1000, course: { name: 'Pedagogia', graduates: 600 } },
      techCareer: { slug: 'analista-de-dados', postings: 12 },
    })
  })

  it('says nothing it does not know', () => {
    const empty = { ...jobs, areas: [], asks: { experience: [] }, careers: [] } as unknown as JobMarket
    expect(marketSummary(empty, { ...education, areas: [] })).toMatchObject({
      noExperience: null,
      area: null,
      techCareer: null,
      graduates: { course: null },
    })
  })
})
