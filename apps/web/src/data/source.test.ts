import { describe, expect, it } from 'vitest'
import { HEALTH_CAREERS } from './demo/healthCareers'
import { OFFSHORE_CAREERS } from './demo/offshoreTrades'
import { PROJECT_CAREERS } from './demo/projectManagement'
import { getCareer, listAcademies, listCareers, listCompanies, listCvExamples, listPrograms } from './source'
import { GROUP_AREAS, MARKET_AREAS } from './types'

describe('demo data source', () => {
  it('lists the careers of every area (27 of technology, 39 of health), each with its full guide (ADR 0015)', async () => {
    const careers = await listCareers()
    const areas = careers.map((career) => GROUP_AREAS[career.group])
    expect(areas.filter((area) => area === 'technology')).toHaveLength(27)
    expect(areas.filter((area) => area === 'health')).toHaveLength(39)
    expect(new Set(areas)).toEqual(new Set(MARKET_AREAS))
    expect(careers.filter((career) => !career.detailed)).toEqual([])
    const slugs = careers.map((career) => career.slug)
    for (const career of [...HEALTH_CAREERS, ...PROJECT_CAREERS, ...OFFSHORE_CAREERS]) {
      expect(slugs).toContain(career.slug)
    }
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

  it('links courses and employers only to careers that exist', async () => {
    const known = new Set((await listCareers()).map((career) => career.slug))
    const linked = [
      ...(await listAcademies()).flatMap((academy) => academy.offers.flatMap((offer) => offer.careers)),
      ...(await listCompanies()).flatMap((company) => company.careers),
    ]
    expect(linked.length).toBeGreaterThan(0)
    expect(linked.filter((slug) => !known.has(slug))).toEqual([])
  })

  it('answers 404 (null) for an unknown career', async () => {
    expect(await getCareer('nao-existe')).toBeNull()
    expect((await getCareer('analista-de-dados'))?.name).toBe('Analista de Dados')
  })

  it('has no made-up programs any more, and filters model CVs by career', async () => {
    // The fictional "Exemplo" ranking was emptied: the catalogue only shows real offers.
    expect(await listPrograms()).toEqual([])
    expect(await listPrograms('designer-ui-ux')).toEqual([])
    expect((await listCvExamples('analista-de-dados')).map((cv) => cv.id)).toEqual([
      'dados-junior',
      'dados-reconversao',
    ])
  })

  it('uses fictional institutions only', async () => {
    for (const program of await listPrograms()) {
      expect(program.institution.name).toContain('Exemplo')
    }
  })
})
