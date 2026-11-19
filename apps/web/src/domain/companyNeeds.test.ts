import { describe, expect, it } from 'vitest'
import { CAREER_SUMMARIES, CAREERS } from '../data/demo/careers'
import { COMPANIES } from '../data/demo/companies'
import {
  type Career,
  type CareerSummary,
  type Company,
  type CompanySector,
  EDUCATION_LEVELS,
} from '../data/types'
import { companyNeeds, companyRoles } from './companyNeeds'

// What it takes to work as a career at one company: estimated from the career and the company's sector, except
// what the company published (the BAI's ads, the BFA's trainee programme).

const career = (slug: string): Career => {
  const found = CAREERS.find((item) => item.slug === slug)
  if (!found) throw new Error(`No demo career ${slug}`)
  return found
}
const company = (id: string): Company => {
  const found = COMPANIES.find((item) => item.id === id)
  if (!found) throw new Error(`No demo company ${id}`)
  return found
}
/** A demo company moved to another sector, without programmes. */
const inSector = (sector: CompanySector, programs: Company['programs'] = []): Company => ({
  ...company('bai'),
  id: 'test',
  sector,
  programs,
})

const cyber = career('analista-de-ciberseguranca')

describe('companyNeeds', () => {
  it('uses what the BAI published: the experience and the duty of its ad, with the source', () => {
    const needs = companyNeeds(company('bai'), cyber)

    expect(needs.experienceYears).toBe(5)
    expect(needs.duty).toMatch(/vulnerabilidades/)
    expect(needs.published.experience?.label).toBe('Jobartis, anúncios do BAI')
    expect(needs.estimated).toBe(true)
  })

  it('uses the BFA trainee programme as its hiring steps', () => {
    const needs = companyNeeds(company('bfa'), cyber)

    expect(needs.hiring).toEqual(['programa', 'portal', 'provas', 'perfil', 'entrevista'])
    expect(needs.published.hiring?.label).toBe('BFA, Futuro BFA')
    expect(needs.duty).toBeUndefined()
  })

  it('estimates the hiring steps from the sector', () => {
    expect(companyNeeds(inSector('estado'), cyber).hiring).toEqual(['concurso', 'provas', 'entrevista'])
    expect(companyNeeds(inSector('tecnologia'), cyber).hiring).toEqual(['portal', 'tecnica', 'entrevista'])
    expect(companyNeeds(inSector('banca'), cyber).hiring).toEqual(['portal', 'provas', 'entrevista'])
    expect(companyNeeds(inSector('comercio' as CompanySector), cyber).hiring).toEqual([
      'portal',
      'entrevista',
    ])
  })

  it('a company with a programme starts with it and asks for no experience', () => {
    const programs = company('bfa').programs
    expect(programs.length).toBeGreaterThan(0)

    const needs = companyNeeds(inSector('banca', programs), cyber)

    expect(needs.hiring[0]).toBe('programa')
    expect(needs.experienceYears).toBe(0)
    expect(needs.published).toEqual({})
  })

  it('a formal employer asks for at least a year and the degree; the others for the shortest path', () => {
    const formal = companyNeeds(inSector('banca'), cyber)
    const informal = companyNeeds(inSector('comercio' as CompanySector), cyber)
    const levels = cyber.pathways.flatMap((pathway) =>
      pathway.steps.flatMap((step) => (step.kind === 'academico' && step.level ? [step.level] : [])),
    )

    expect(formal.experienceYears).toBeGreaterThanOrEqual(1)
    expect(informal.experienceYears).toBeLessThanOrEqual(formal.experienceYears)
    // The cyber-security analyst has a licenciatura path: the formal employer asks for it.
    expect(levels).toContain('licenciatura')
    expect(formal.education?.level).toBe('licenciatura')
    expect(informal.education?.level).toBe(
      levels.toSorted((a, b) => EDUCATION_LEVELS.indexOf(a) - EDUCATION_LEVELS.indexOf(b))[0],
    )
  })

  it('lists at most 6 skills, the essential ones first, and 3 required certifications', () => {
    for (const item of CAREERS) {
      const needs = companyNeeds(inSector('tecnologia'), item)
      expect(needs.skills.length).toBeLessThanOrEqual(6)
      expect(needs.certifications.length).toBeLessThanOrEqual(3)
      const essential = item.skills
        .filter((skill) => skill.importance === 'essencial')
        .map((skill) => skill.name)
      const pool = essential.length > 0 ? essential : item.skills.map((skill) => skill.name)
      expect(pool).toEqual(expect.arrayContaining(needs.skills))
    }
  })

  it('a career without academic steps or stages asks for no degree and no experience', () => {
    const bare: Career = { ...cyber, slug: 'bare', pathways: [], stages: [], skills: [] }

    const needs = companyNeeds(inSector('comercio' as CompanySector), bare)

    expect(needs.education).toBeNull()
    expect(needs.experienceYears).toBe(0)
    expect(needs.skills).toEqual([])
    expect(needs.certifications).toEqual([])
  })
})

describe('companyRoles', () => {
  const careers = [{ ...CAREER_SUMMARIES[0], name: 'Analista', slug: 'analista' }] as CareerSummary[]

  it('uses the posts the company advertised', () => {
    const roles = [{ title: 'Técnico de redes', careers: ['tecnico-de-redes'] }]

    expect(companyRoles({ ...company('bai'), roles }, careers)).toBe(roles)
  })

  it('without advertised posts, one per career it hires for', () => {
    expect(companyRoles({ ...company('bai'), roles: [] }, careers)).toEqual([
      { title: 'Analista', careers: ['analista'] },
    ])
    expect(companyRoles({ ...company('bai'), roles: undefined }, careers)).toHaveLength(1)
  })
})
