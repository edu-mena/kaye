import { describe, expect, it } from 'vitest'
import { CAREERS } from '../data/demo/careers'
import { careerFit, interestLevel } from './fit'

const frontend = CAREERS[0]!

describe('interestLevel', () => {
  it('has three honest levels', () => {
    expect(interestLevel(0.8)).toBe('alto')
    expect(interestLevel(0.6)).toBe('medio')
    expect(interestLevel(0.3)).toBe('baixo')
  })
})

describe('careerFit', () => {
  it('leaves each part empty until the person gives what it needs', () => {
    const fit = careerFit(frontend, { profile: null, education: null, skills: {} })
    expect(fit.interests).toBeNull()
    expect(fit.education).toBeNull()
    expect(fit.skills).toMatchObject({ have: 0, total: 6 })
  })

  it('measures interests, education and essential skills separately', () => {
    const fit = careerFit(frontend, {
      profile: frontend.riasec,
      education: 'medio_tecnico',
      skills: { javascript: 'sei', 'html-css': 'domino', react: 'aprender', typescript: 'domino' },
    })
    expect(fit.interests).toMatchObject({ level: 'alto', strength: 'I' })
    expect(fit.education).toMatchObject({ pathwayName: 'Via técnica' })
    expect(fit.education?.steps).toHaveLength(3)
    // "A aprender" does not count yet, and TypeScript is optional.
    expect(fit.skills.have).toBe(2)
    expect(fit.skills.missing.map((skill) => skill.id)).toEqual([
      'react',
      'git',
      'apis-rest',
      'design-responsivo',
    ])
  })
})
