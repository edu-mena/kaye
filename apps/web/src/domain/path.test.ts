import { describe, expect, it } from 'vitest'
import type { NewsItem } from '../data/types'
import { EMPTY_CV } from '../state/userStore'
import { isAboutMe, isUnseen, myCareers, pathSteps } from './path'

const person = {
  profile: {},
  assessmentCompletedAt: '2026-10-01T10:00:00Z',
  targetCareer: null,
  savedCareers: ['analista-de-dados'],
  skills: {},
  cv: EMPTY_CV,
  compare: [],
}
const news = (careers?: string[], date = '2026-10-20') => ({ id: 'n', date, careers }) as NewsItem

describe('pathSteps', () => {
  it('marks what is done and points the skills step to the destination when there is one', () => {
    expect(pathSteps(person).map((step) => [step.id, step.done])).toEqual([
      ['perfil', true],
      ['teste', true],
      ['destino', false],
      ['competencias', false],
      ['cv', false],
      ['cursos', false],
    ])
    const target = pathSteps({ ...person, targetCareer: 'designer-ui-ux' })
    expect(target.find((step) => step.id === 'competencias')?.to).toBe('/carreiras/designer-ui-ux')
  })
})

describe('news about the person', () => {
  it('is about a saved career or the destination', () => {
    const mine = myCareers({ ...person, targetCareer: 'designer-ui-ux' })
    expect(isAboutMe(news(['designer-ui-ux']), mine)).toBe(true)
    expect(isAboutMe(news(['analista-de-dados']), mine)).toBe(true)
    expect(isAboutMe(news(['engenheiro-devops']), mine)).toBe(false)
    expect(isAboutMe(news(), mine)).toBe(false)
  })

  it('is new until the day the notifications are opened', () => {
    expect(isUnseen(news([], '2026-10-20'), null)).toBe(true)
    expect(isUnseen(news([], '2026-10-20'), '2026-10-19T23:00:00Z')).toBe(true)
    expect(isUnseen(news([], '2026-10-20'), '2026-10-20T08:00:00Z')).toBe(false)
  })
})
