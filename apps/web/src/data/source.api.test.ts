import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockFetchJson } from '../test/render'

// VITE_DATA_SOURCE=api: every read goes to /api/v1 (docs/arquitetura.md, section 6), a 404 is null as in the
// demo, and any other failure is an error the screen shows, never the demo data.

type Source = typeof import('./source')

async function apiSource(): Promise<Source> {
  vi.stubEnv('VITE_DATA_SOURCE', 'api')
  vi.resetModules()
  return import('./source')
}

const calledPath = (fetchMock: ReturnType<typeof mockFetchJson>, call = 0) => fetchMock.mock.calls[call]?.[0]

describe('API data source', () => {
  let source: Source

  beforeEach(async () => {
    source = await apiSource()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('reads each list and detail from its route', async () => {
    const cases: [() => Promise<unknown>, string][] = [
      [() => source.listCareers(), '/api/v1/occupations'],
      [() => source.listCareerTraits(), '/api/v1/occupations?fields=traits'],
      [() => source.getCareer('analista de dados'), '/api/v1/occupations/analista%20de%20dados'],
      [() => source.listSkills(), '/api/v1/skills'],
      [() => source.listSupportPrograms(), '/api/v1/support-programs'],
      [() => source.listPrograms(), '/api/v1/programs'],
      [() => source.listPrograms('enfermeiro'), '/api/v1/programs?occupation=enfermeiro'],
      [() => source.listAcademies(), '/api/v1/institutions'],
      [() => source.getAcademy('isptec'), '/api/v1/institutions/isptec'],
      [() => source.listCourses(), '/api/v1/courses'],
      [() => source.getCourse('enfermagem'), '/api/v1/courses/enfermagem'],
      [() => source.listCompanies(), '/api/v1/companies'],
      [() => source.getCompany('africell'), '/api/v1/companies/africell'],
      [() => source.getJobMarket(), '/api/v1/market/jobs'],
      [() => source.getMarketWeek(), '/api/v1/market/week'],
      [() => source.getEducation(), '/api/v1/market/education'],
      [() => source.getEmployment(), '/api/v1/market/employment'],
      [() => source.listNews(), '/api/v1/news'],
      [() => source.listScholarships(), '/api/v1/scholarships'],
      [() => source.listInternships(), '/api/v1/internships'],
      [() => source.listFreeCourses(), '/api/v1/free-courses'],
      [() => source.listFreeCourses('enfermeiro'), '/api/v1/free-courses?occupation=enfermeiro'],
      [() => source.listAdmissions(), '/api/v1/admissions'],
      [() => source.listFigures(), '/api/v1/figures'],
      [() => source.listCvExamples(), '/api/v1/cv-examples'],
      [() => source.listCvExamples('enfermeiro'), '/api/v1/occupations/enfermeiro/cv-examples'],
      [() => source.listTestimonials(), '/api/v1/testimonials'],
      [() => source.listTestimonials('enfermeiro'), '/api/v1/occupations/enfermeiro/testimonials'],
    ]
    for (const [read, path] of cases) {
      const fetchMock = mockFetchJson([{ id: 'from-api' }])
      await expect(read()).resolves.toEqual([{ id: 'from-api' }])
      expect(calledPath(fetchMock)).toBe(path)
    }
  })

  it('asks for the assessment in the language given', async () => {
    const fetchMock = mockFetchJson([])

    await source.getAssessment('fr')

    expect(calledPath(fetchMock)).toBe('/api/v1/assessment')
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('Accept-Language')).toBe('fr')
  })

  it('reads a detail that is not there (404) as null', async () => {
    mockFetchJson({ message: 'Not Found' }, 404)

    await expect(source.getCareer('nao-existe')).resolves.toBeNull()
    await expect(source.getAcademy('nao-existe')).resolves.toBeNull()
    await expect(source.getCourse('nao-existe')).resolves.toBeNull()
    await expect(source.getCompany('nao-existe')).resolves.toBeNull()
  })

  it('answers null for an empty slug without asking (the route would be the whole list)', async () => {
    const fetchMock = mockFetchJson([{ slug: 'a-lista-toda' }])

    await expect(source.getCareer('')).resolves.toBeNull()
    await expect(source.getAcademy('')).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('points the photos of an answer to the files of the build', async () => {
    mockFetchJson([{ image: { src: '/eventos/batuque-fest.webp' }, to: '/plano' }])

    const [news] = await source.listNews()

    expect(news).toEqual({
      image: { src: `${import.meta.env.BASE_URL}eventos/batuque-fest.webp` },
      to: '/plano',
    })
  })

  it('fails when the API fails, without falling back to the demo data', async () => {
    mockFetchJson({ message: 'Server Error' }, 500)

    await expect(source.listCareers()).rejects.toMatchObject({ status: 500 })
    await expect(source.getCareer('analista-de-dados')).rejects.toMatchObject({ status: 500 })
  })
})

describe('API data source and the demo module', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.doUnmock('./source.demo')
  })

  it('never loads the demo module: the production bundle leaves the demo data out', async () => {
    const loaded = vi.fn<() => void>()
    vi.doMock('./source.demo', () => {
      loaded()
      return {}
    })
    const source = await apiSource()
    mockFetchJson([])

    await source.listCareers()
    await source.listCompanies()
    await source.getAssessment('pt')

    expect(loaded).not.toHaveBeenCalled()
  })
})
