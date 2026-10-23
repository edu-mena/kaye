import { describe, expect, it } from 'vitest'
import { safeNext } from '../lib/ui'
import { EMPTY_CV, type UserData } from '../state/userStore'
import { seedUser } from '../test/user'
import { achievements, totalXp } from './achievements'
import { cvCompleteness, newEntry, parseList } from './cv'
import { formatKz, formatPercent } from './format'

describe('format', () => {
  it('writes kwanzas the Angolan way', () => {
    expect(formatKz(350000)).toBe('350.000 Kz')
    expect(formatKz(1500000.4)).toBe('1.500.000 Kz')
    expect(formatKz(900)).toBe('900 Kz')
  })

  it('writes shares as whole percentages', () => {
    expect(formatPercent(0.625)).toBe('63%')
  })
})

describe('cv', () => {
  it('measures how complete a CV is', () => {
    expect(cvCompleteness(EMPTY_CV)).toBe(0)
    const full = {
      ...EMPTY_CV,
      name: 'Ana',
      headline: 'Designer',
      contact: 'ana@exemplo.ao',
      summary: 'Resumo',
      education: [{ ...newEntry(), title: 'Curso' }],
      projects: [{ ...newEntry(), title: 'App' }],
      skills: ['Figma'],
    }
    expect(cvCompleteness(full)).toBe(1)
  })

  it('splits comma-separated lists', () => {
    expect(parseList(' React, Git ,, Figma ')).toEqual(['React', 'Git', 'Figma'])
  })

  it('gives every new entry its own id', () => {
    expect(newEntry().id).not.toBe(newEntry().id)
  })
})

describe('achievements', () => {
  it('earns points only for what was done', () => {
    const fresh = achievements(seedUser({ profile: null }) as UserData)
    expect(totalXp(fresh)).toBe(0)

    const busy = achievements(
      seedUser({
        assessmentCompletedAt: '2026-10-23',
        visitedCareers: ['a', 'b', 'c'],
        targetCareer: 'a',
        skills: { a: 'sei', b: 'sei', c: 'sei', d: 'aprender', e: 'domino' },
      }),
    )
    expect(busy.filter((item) => item.earned).map((item) => item.id)).toEqual([
      'perfil',
      'teste',
      'explorador',
      'destino',
      'competencias',
    ])
    expect(totalXp(busy)).toBe(400)
  })
})

describe('safeNext', () => {
  it('only allows paths inside the app', () => {
    expect(safeNext('/teste')).toBe('/teste')
    expect(safeNext('//evil.example')).toBeNull()
    expect(safeNext('/\\evil.example')).toBeNull()
    expect(safeNext('https://evil.example')).toBeNull()
    expect(safeNext(null)).toBeNull()
  })
})
