import { describe, expect, it } from 'vitest'
import type { Academy, AcademyOffer } from '../data/types'
import { catalogCourses, filterCourses } from './courses'

const offer = (name: string, extra: Partial<AcademyOffer> = {}): AcademyOffer => ({
  course: { id: name.toLowerCase().replace(/\s+/g, '-'), name },
  name,
  level: 'licenciatura',
  careers: [],
  areas: [],
  ...extra,
})

const academy = (id: string, offers: AcademyOffer[]): Academy => ({
  id,
  name: id.toUpperCase(),
  type: 'universidade',
  ownership: 'publica',
  province: 'Luanda',
  place: 'Luanda',
  summary: '',
  offers,
  sources: [],
})

const ACADEMIES = [
  academy('a', [
    offer('Enfermagem', { careers: ['enfermeiro'], areas: ['enfermagem'], students: 100, graduates: 10 }),
    offer('Engenharia Informática', { areas: ['desenvolvimento'], students: 300 }),
  ]),
  academy('b', [
    offer('Enfermagem', {
      level: 'medio_tecnico',
      careers: ['tecnico-medio-enfermagem'],
      areas: ['enfermagem'],
      students: 250,
    }),
    offer('Medicina', { careers: ['medico-clinica-geral'], areas: ['medicina'] }),
  ]),
]

describe('catalogCourses', () => {
  it('joins the offers of one course at every institution, the most studied first', () => {
    const courses = catalogCourses(ACADEMIES)
    expect(courses.map((course) => course.name)).toEqual(['Enfermagem', 'Engenharia Informática', 'Medicina'])
    const nursing = courses[0]
    expect(nursing?.offers.map(({ academy: { id } }) => id)).toEqual(['a', 'b'])
    expect(nursing?.levels).toEqual(['medio_tecnico', 'licenciatura'])
    expect(nursing?.areas).toEqual(['health'])
    expect(nursing?.careers).toEqual(['enfermeiro', 'tecnico-medio-enfermagem'])
    expect([nursing?.students, nursing?.graduates]).toEqual([350, 10])
  })
})

describe('filterCourses', () => {
  const courses = catalogCourses(ACADEMIES)
  const names = (filter: Parameters<typeof filterCourses>[1]) =>
    filterCourses(courses, filter).map((course) => course.name)

  it('lets every course through with no filter', () => {
    expect(names({})).toHaveLength(3)
  })

  it('filters by area, level and career together', () => {
    expect(names({ area: 'health' })).toEqual(['Enfermagem', 'Medicina'])
    expect(names({ area: 'health', level: 'medio_tecnico' })).toEqual(['Enfermagem'])
    expect(names({ career: 'medico-clinica-geral' })).toEqual(['Medicina'])
  })

  it('searches the start of the words, without accents', () => {
    expect(names({ query: 'informatica' })).toEqual(['Engenharia Informática'])
    expect(names({ query: 'medi' })).toEqual(['Medicina'])
    expect(names({ query: 'ica' })).toEqual([])
  })
})
