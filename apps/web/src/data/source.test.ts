import { describe, expect, it } from 'vitest'
import { QUESTIONS } from './demo/assessment'
import { getAssessment, getCareer, listAcademies, listCareers, listCvExamples, listPrograms } from './source'
import { RIASEC_KEYS } from './types'

describe('demo data source', () => {
  it('lists the 27 MVP careers and marks the curated ones', async () => {
    const careers = await listCareers()
    expect(careers).toHaveLength(27)
    expect(careers.filter((career) => career.detailed).map((career) => career.slug)).toEqual([
      'desenvolvedor-frontend',
      'analista-de-dados',
      'designer-ui-ux',
    ])
  })

  it('lists real academies: each with a source, none sharing a name with the fictional ranking', async () => {
    const academies = await listAcademies()
    expect(new Set(academies.map((academy) => academy.id)).size).toBe(academies.length)
    for (const academy of academies) {
      expect(academy.sources.length).toBeGreaterThan(0)
      for (const source of academy.sources) expect(source.url).toMatch(/^https:\/\//)
    }
    const fictional = new Set((await listPrograms()).map((program) => program.institution.name))
    expect(academies.filter((academy) => fictional.has(academy.name))).toEqual([])
  })

  it('answers 404 (null) for an unknown career', async () => {
    expect(await getCareer('nao-existe')).toBeNull()
    expect((await getCareer('analista-de-dados'))?.name).toBe('Analista de Dados')
  })

  it('filters courses and model CVs by career', async () => {
    expect((await listPrograms('designer-ui-ux')).every((p) => p.careers.includes('designer-ui-ux'))).toBe(
      true,
    )
    expect((await listPrograms()).length).toBeGreaterThan((await listPrograms('designer-ui-ux')).length)
    expect((await listCvExamples('analista-de-dados')).map((cv) => cv.id)).toEqual([
      'dados-junior',
      'dados-reconversao',
    ])
  })

  it('has 42 questions, 7 per dimension, never two of the same in a row', async () => {
    const questions = await getAssessment()
    expect(questions).toHaveLength(42)
    for (const key of RIASEC_KEYS) {
      expect(questions.filter((question) => question.dimension === key)).toHaveLength(7)
    }
    expect(
      QUESTIONS.every((question, i) => i === 0 || question.dimension !== QUESTIONS[i - 1]?.dimension),
    ).toBe(true)
    expect(new Set(questions.map((question) => question.id)).size).toBe(42)
  })

  it('uses fictional institutions only', async () => {
    for (const program of await listPrograms()) {
      expect(program.institution.name).toContain('Exemplo')
    }
  })
})
