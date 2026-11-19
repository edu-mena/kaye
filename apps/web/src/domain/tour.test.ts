import { describe, expect, it } from 'vitest'
import { tourSteps } from './tour'

// The tutorial after the onboarding: steps chosen by what the person came for, at most 6, always ending with
// the news and the deadlines.

const ids = (...args: Parameters<typeof tourSteps>) => tourSteps(...args).map((step) => step.id)

describe('tourSteps', () => {
  it('without the onboarding answers, shows the discovery steps', () => {
    expect(ids(null, 'analista')).toEqual([
      'test',
      'recommended',
      'plan',
      'psychotech',
      'subscribe',
      'deadlines',
    ])
  })

  it('a pupil choosing a course takes the test first', () => {
    expect(ids({ goal: 'course', situation: 'school' }, null)).toEqual([
      'test',
      'courses',
      'admissions',
      'compare',
      'subscribe',
      'deadlines',
    ])
  })

  it('a student or a job seeker who wants to discover also sees the internships, within 6 steps', () => {
    const steps = ids({ goal: 'discover', situation: 'university' }, null)

    expect(steps).toHaveLength(6)
    expect(steps.slice(-2)).toEqual(['subscribe', 'deadlines'])
    expect(ids({ goal: 'change', situation: 'seeking' }, 'analista')).toContain('noDegree')
  })

  it('a job seeker gets the interviews for the CV, and the paths without a degree for a job', () => {
    expect(ids({ goal: 'cv', situation: 'seeking' }, null)).toEqual([
      'cv',
      'card',
      'interviews',
      'subscribe',
      'deadlines',
    ])
    expect(ids({ goal: 'job', situation: 'seeking' }, null)).toEqual([
      'internships',
      'interviews',
      'cv',
      'noDegree',
      'subscribe',
      'deadlines',
    ])
    expect(ids({ goal: 'job', situation: 'working' }, null)).toEqual([
      'internships',
      'interviews',
      'cv',
      'subscribe',
      'deadlines',
    ])
  })

  it('the career steps need a career, and each step knows its page', () => {
    expect(ids({ goal: 'change', situation: 'working' }, null)).toEqual([
      'recommended',
      'noDegree',
      'subscribe',
      'deadlines',
    ])

    const steps = tourSteps({ goal: 'change', situation: 'working' }, 'analista')
    expect(steps).toEqual([
      { id: 'recommended', to: '/' },
      { id: 'noDegree', to: '/sem-universidade' },
      { id: 'freeCourses', to: '/carreiras/analista' },
      { id: 'selfEmployment', to: '/carreiras/analista' },
      { id: 'subscribe', to: '/novidades' },
      { id: 'deadlines', to: '/prazos' },
    ])
    expect(tourSteps({ goal: 'course', situation: 'working' }, null).map((step) => step.to)).toEqual([
      '/cursos',
      '/exames-de-acesso',
      '/cursos/comparar',
      '/novidades',
      '/prazos',
    ])
    expect(tourSteps(null, null).find((step) => step.id === 'psychotech')?.to).toBe('/testes')
    expect(tourSteps({ goal: 'cv', situation: 'working' }, null).find((step) => step.id === 'card')?.to).toBe(
      '/cv/cartao',
    )
    expect(tourSteps({ goal: 'job', situation: 'working' }, null)[0]?.to).toBe('/oportunidades?tab=estagios')
  })
})
