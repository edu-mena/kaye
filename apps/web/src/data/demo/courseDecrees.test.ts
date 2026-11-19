import { describe, expect, it } from 'vitest'
import type { Academy } from '../types'
import { withDecrees, type DecreeCourse } from './courseDecrees'

const DECREE = { label: 'Decreto Executivo n.º 1/25', url: 'https://lex.ao/decreto' }

const ACADEMY: Academy = {
  id: 'escola',
  name: 'Escola Superior de Saúde',
  type: 'instituto_superior',
  ownership: 'privada',
  province: 'Luanda',
  place: 'Luanda',
  summary: '',
  offers: [
    {
      course: { id: 'enfermagem', name: 'Enfermagem' },
      name: 'Enfermagem',
      level: 'licenciatura',
      careers: ['enfermeiro'],
      areas: ['enfermagem'],
      students: 100,
    },
  ],
  sources: [],
}

const course = (name: string, extra: Partial<DecreeCourse> = {}): DecreeCourse => ({
  institution: 'Escola Superior de Saúde',
  name,
  level: 'licenciatura',
  careers: [],
  areas: [],
  decree: DECREE,
  ...extra,
})

describe('withDecrees', () => {
  it('gives an offer the yearbook lists its decree and plan of studies, and keeps its students', () => {
    const [academy] = withDecrees(
      [ACADEMY],
      [course('Enfermagem', { periods: [{ label: '1.º ano · 1.º semestre', subjects: ['Anatomia I'] }] })],
    )
    expect(academy?.offers).toHaveLength(1)
    expect(academy?.offers[0]).toMatchObject({
      students: 100,
      recognition: DECREE,
      curriculum: { source: DECREE, periods: [{ subjects: ['Anatomia I'] }] },
    })
    expect(academy?.sources).toEqual([DECREE])
  })

  it('adds a course the yearbook does not list yet, without a plan when the decree has none', () => {
    const [academy] = withDecrees(
      [ACADEMY],
      [course('Fisioterapia', { careers: ['fisioterapeuta'], areas: ['reabilitacao'] })],
    )
    const added = academy?.offers[1]
    expect(added).toMatchObject({
      course: { id: 'fisioterapia' },
      careers: ['fisioterapeuta'],
      recognition: DECREE,
    })
    expect(added).not.toHaveProperty('curriculum')
  })

  it('refuses a course of an institution the catalogue does not have', () => {
    expect(() =>
      withDecrees([ACADEMY], [course('Medicina', { institution: 'Universidade Que Não Existe' })]),
    ).toThrow(/Universidade Que Não Existe/)
  })
})
