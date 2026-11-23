import { describe, expect, it } from 'vitest'
import { CV_EXAMPLES } from '../data/demo/cvExamples'
import type { CareerSummary } from '../data/types'
import { EMPTY_CV } from '../state/userStore'
import { careerTips } from './cvCareer'

const frontend = CV_EXAMPLES.find((example) => example.careerSlug === 'desenvolvedor-frontend')!
const career = { slug: 'desenvolvedor-frontend', group: 'tecnologia' } as unknown as CareerSummary

describe('careerTips', () => {
  it('takes skills and projects from the models of the career, never the ones already on the CV', () => {
    const [first, second] = frontend.cv.skills as [string, string]
    const tips = careerTips(CV_EXAMPLES, [career], 'desenvolvedor-frontend', null, {
      ...EMPTY_CV,
      skills: [first.toUpperCase()],
    })
    expect(tips.skills).toContain(second)
    expect(tips.skills.map((skill) => skill.toLowerCase())).not.toContain(first.toLowerCase())
    expect(tips.entries.find((entry) => entry.title === 'Kitanda Online')?.field).toBe('projects')
    expect(tips.sample).toBe(frontend.cv)
  })

  it('does not offer a project the CV already has', () => {
    const cv = {
      ...EMPTY_CV,
      projects: [{ id: 'p', title: 'kitanda online', place: '', period: '', description: '' }],
    }
    const tips = careerTips(CV_EXAMPLES, [career], 'desenvolvedor-frontend', null, cv)
    expect(tips.entries.map((entry) => entry.title)).not.toContain('Kitanda Online')
  })

  it('still has a model to show when no career or area is known', () => {
    const tips = careerTips(CV_EXAMPLES, [], null, null, EMPTY_CV)
    expect(tips.skills).toEqual([])
    expect(tips.entries).toEqual([])
    expect(tips.sample).not.toBeNull()
    expect(careerTips([], [], null, null, EMPTY_CV).sample).toBeNull()
  })
})
