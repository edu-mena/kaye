import { describe, expect, it } from 'vitest'
import { CV_EXAMPLES } from '../data/demo/cvExamples'
import { EMPTY_CV } from '../state/userStore'
import { cvStrength, STRENGTH_POINTS } from './cvStrength'

const entry = (title: string, description = '') => ({ id: title, title, place: '', period: '', description })

describe('cvStrength', () => {
  it('weighs 100 points in all', () => {
    expect(Object.values(STRENGTH_POINTS).reduce((sum, points) => sum + points, 0)).toBe(100)
  })

  it('is 0 for an empty CV and lists everything, the biggest gain first', () => {
    const { score, missing } = cvStrength(EMPTY_CV)
    expect(score).toBe(0)
    expect(missing[0]).toEqual({ key: 'experience', points: 20 })
    expect(missing).toHaveLength(9)
  })

  it('rises a little with each line, not only when a part is complete', () => {
    const name = cvStrength({ ...EMPTY_CV, name: 'Joana' }).score
    const skills = cvStrength({ ...EMPTY_CV, name: 'Joana', skills: ['Excel'] })
    expect(name).toBe(8)
    expect(skills.score).toBeGreaterThan(name)
    expect(skills.missing.find((gain) => gain.key === 'skills')?.points).toBe(11)
  })

  it('counts a short summary as half, and an entry without a description as most of the experience', () => {
    expect(cvStrength({ ...EMPTY_CV, summary: 'Quero aprender.' }).score).toBe(7)
    expect(cvStrength({ ...EMPTY_CV, summary: 'x'.repeat(60) }).score).toBe(14)
    expect(cvStrength({ ...EMPTY_CV, projects: [entry('Loja')] }).score).toBe(12)
    expect(cvStrength({ ...EMPTY_CV, experience: [entry('Estágio', 'Atendi clientes')] }).score).toBe(20)
  })

  it('reaches 100 with nothing missing for a full CV', () => {
    const cv = {
      ...CV_EXAMPLES[0]!.cv,
      links: ['github.com/x'],
      summary: 'x'.repeat(80),
      skills: ['a', 'b', 'c', 'd', 'e'],
    }
    expect(cvStrength(cv)).toEqual({ score: 100, missing: [] })
  })
})
