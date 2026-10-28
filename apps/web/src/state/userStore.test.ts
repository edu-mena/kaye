import { describe, expect, it, vi } from 'vitest'
import { CV_EXAMPLES } from '../data/demo/cvExamples'
import { seedUser } from '../test/user'
import { getUser, MAX_COMPARE, MAX_HISTORY, MAX_SEARCHES, reloadUser, userActions } from './userStore'

describe('userStore', () => {
  it('starts empty and saves every action on the device', () => {
    expect(getUser().profile).toBeNull()
    userActions.answer('R1', 4)
    expect(JSON.parse(localStorage.getItem('kaye.user.v1') ?? '{}').answers).toEqual({ R1: 4 })
  })

  it('starts fresh when the saved data is corrupted or from another version', () => {
    localStorage.setItem('kaye.user.v1', '{not json')
    reloadUser()
    expect(getUser().profile).toBeNull()

    localStorage.setItem('kaye.user.v1', JSON.stringify({ version: 99, profile: { name: 'x' } }))
    reloadUser()
    expect(getUser().profile).toBeNull()
  })

  it('keeps working in memory when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'QuotaExceededError')
    })
    expect(() => userActions.toggleSaved('x')).not.toThrow()
    expect(getUser().savedCareers).toEqual(['x'])
  })

  it('completes and restarts the test', () => {
    userActions.answer('I1', 5)
    userActions.completeAssessment()
    expect(getUser().assessmentCompletedAt).not.toBeNull()
    userActions.restartAssessment()
    expect(getUser()).toMatchObject({ answers: {}, assessmentCompletedAt: null })
  })

  it('marks and unmarks skills', () => {
    userActions.setSkill('react', 'sei')
    userActions.setSkill('git', 'aprender')
    userActions.setSkill('react', null)
    expect(getUser().skills).toEqual({ git: 'aprender' })
  })

  it('remembers visited careers once and a single destination', () => {
    userActions.visitCareer('a')
    userActions.visitCareer('a')
    userActions.setTarget('a')
    expect(getUser()).toMatchObject({ visitedCareers: ['a'], targetCareer: 'a' })
    userActions.setTarget(null)
    expect(getUser().targetCareer).toBeNull()
  })

  it(`compares at most ${MAX_COMPARE} courses`, () => {
    for (const id of ['a', 'b', 'c', 'd']) userActions.toggleCompare(id)
    expect(getUser().compare).toEqual(['a', 'b', 'c'])
    userActions.toggleCompare('b')
    expect(getUser().compare).toEqual(['a', 'c'])
  })

  it('starting from a model CV copies its structure, never its data', () => {
    seedUser()
    const example = CV_EXAMPLES[0]!
    userActions.startCvFrom(example)
    const { cv, cvBasedOn } = getUser()
    expect(cvBasedOn).toBe(example.id)
    expect(cv.name).toBe('Joana')
    expect(cv.summary).toBe('')
    expect(cv.experience).toHaveLength(example.cv.experience.length)
    expect(cv.experience.every((entry) => entry.title === '' && entry.id !== '')).toBe(true)
  })

  it('keeps a history of the steps, newest first, without removals or repeats', () => {
    userActions.saveProfile({
      name: 'A',
      birthYear: 2006,
      province: 'Luanda',
      education: 'medio_tecnico',
      guardianInformed: false,
    })
    userActions.visitCareer('x')
    userActions.visitCareer('x')
    userActions.toggleSaved('x')
    userActions.toggleSaved('x')
    userActions.setTarget('x')
    userActions.setTarget(null)
    userActions.toggleCompare('c1')
    userActions.completeAssessment()
    userActions.saveProfile({
      name: 'B',
      birthYear: 2006,
      province: 'Luanda',
      education: 'medio_tecnico',
      guardianInformed: false,
    })
    expect(getUser().history.map((event) => `${event.type}${event.ref ? `:${event.ref}` : ''}`)).toEqual([
      'profileEdit',
      'test',
      'compare:c1',
      'target:x',
      'saved:x',
      'visit:x',
      'profile',
    ])
    expect(getUser().history[0]?.at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it(`keeps at most ${MAX_HISTORY} steps`, () => {
    for (let index = 0; index < MAX_HISTORY + 5; index += 1) userActions.visitCareer(`career-${index}`)
    expect(getUser().history).toHaveLength(MAX_HISTORY)
    expect(getUser().history[0]?.ref).toBe(`career-${MAX_HISTORY + 4}`)
  })

  it(`keeps the last ${MAX_SEARCHES} searches, without repeats or blanks`, () => {
    userActions.addSearch('  dados  ')
    userActions.addSearch('   ')
    for (let index = 0; index < MAX_SEARCHES; index += 1) userActions.addSearch(`pesquisa ${index}`)
    userActions.addSearch('Pesquisa   2')

    expect(getUser().searches).toHaveLength(MAX_SEARCHES)
    expect(getUser().searches[0]).toBe('Pesquisa 2')
    expect(getUser().searches.filter((entry) => entry.toLowerCase() === 'pesquisa 2')).toHaveLength(1)
    expect(getUser().searches).not.toContain('dados')

    userActions.clearSearches()
    expect(getUser().searches).toEqual([])
  })

  it('opens data saved before the searches existed', () => {
    localStorage.setItem('kaye.user.v1', JSON.stringify({ version: 1, savedCareers: ['a'] }))
    reloadUser()
    expect(getUser().searches).toEqual([])
    expect(getUser().savedCareers).toEqual(['a'])
  })

  it('erases everything it keeps', () => {
    seedUser({ savedCareers: ['a'] })
    userActions.eraseAll()
    expect(getUser().profile).toBeNull()
    expect(localStorage.getItem('kaye.user.v1')).toBeNull()
  })
})
