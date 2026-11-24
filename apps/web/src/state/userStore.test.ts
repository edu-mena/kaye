import { describe, expect, it, vi } from 'vitest'
import { CV_EXAMPLES } from '../data/demo/cvExamples'
import { seedUser } from '../test/user'
import {
  getUser,
  MAX_COMPARE,
  MAX_HISTORY,
  MAX_SEARCHES,
  reloadUser,
  replaceUser,
  toAccount,
  userActions,
} from './userStore'

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
    const { cv, basedOn } = getUser().cvs[0]!
    expect(basedOn).toBe(example.id)
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

  it('takes the account copy, keeping this device photo and cutting the merged lists to size', () => {
    seedUser({ photo: 'data:photo', cover: 'data:cover', savedCareers: ['a'] })
    const searches = Array.from({ length: MAX_SEARCHES + 3 }, (_, index) => `s${index}`)

    replaceUser({ version: 1, savedCareers: ['a', 'b'], searches, photo: 'data:other' })

    expect(getUser()).toMatchObject({ savedCareers: ['a', 'b'], photo: 'data:photo', cover: 'data:cover' })
    expect(getUser().searches).toHaveLength(MAX_SEARCHES)
    // Fields the copy does not have are filled in, as for old data on the device.
    expect(getUser().savedAcademies).toEqual([])
    expect(JSON.parse(localStorage.getItem('kaye.user.v1') ?? '{}').savedCareers).toEqual(['a', 'b'])
  })

  it('ignores an account copy from another version of the app', () => {
    seedUser({ savedCareers: ['a'] })

    replaceUser({ version: 2 as unknown as 1, savedCareers: [] })

    expect(getUser().savedCareers).toEqual(['a'])
  })

  it('sends the account everything except the photo and the cover', () => {
    seedUser({ photo: 'data:photo', cover: 'data:cover', savedCareers: ['a'] })

    const sent = toAccount(getUser())

    expect(sent).not.toHaveProperty('photo')
    expect(sent).not.toHaveProperty('cover')
    expect(sent.savedCareers).toEqual(['a'])
  })

  it('erases everything it keeps', () => {
    seedUser({ savedCareers: ['a'] })
    userActions.eraseAll()
    expect(getUser().profile).toBeNull()
    expect(localStorage.getItem('kaye.user.v1')).toBeNull()
  })
})

const today = () => new Date().toLocaleDateString('sv-SE')

describe('userStore: the home (streak, challenge, feed)', () => {
  it('counts a day once, however many things are done in it', () => {
    seedUser()
    userActions.recordActivity()
    userActions.recordActivity()
    expect(getUser().activity).toEqual([today()])
  })

  it('counts what is useful, and only that', () => {
    seedUser({ savedCareers: ['a'] })
    // Opening the home, searching or removing a saved career is not an action that counts.
    userActions.toggleSaved('a')
    userActions.addSearch('enfermeiro')
    expect(getUser().activity ?? []).toEqual([])

    userActions.toggleSaved('b')
    expect(getUser().activity).toEqual([today()])
  })

  it.each([
    ['visiting a career', () => userActions.visitCareer('x')],
    ['saving an academy', () => userActions.toggleSavedAcademy('x')],
    ['saving a company', () => userActions.toggleSavedCompany('x')],
    ['answering a test question', () => userActions.answer('R1', 3)],
    ['choosing a card in a situation', () => userActions.choose('S1', 'I')],
    ['finishing a step of a Kurso', () => userActions.completeKursoStep('ingles', 'u1/l1')],
  ])('%s counts for the streak', (_name, act) => {
    seedUser()
    act()
    expect(getUser().activity).toEqual([today()])
  })

  it('keeps at most 60 days, the newest', () => {
    const old = Array.from(
      { length: 70 },
      (_, index) => `2026-01-${String((index % 28) + 1).padStart(2, '0')}-${index}`,
    )
    seedUser({ activity: old })
    userActions.recordActivity()
    expect(getUser().activity).toHaveLength(60)
    expect(getUser().activity).toContain(today())
  })

  it('keeps the first answer of the challenge of a day, and counts the day', () => {
    seedUser()
    userActions.answerDaily('2026-11-24', 1, true)
    userActions.answerDaily('2026-11-24', 2, false)
    expect(getUser().daily).toEqual({ '2026-11-24': { picked: 1, correct: true } })
    expect(getUser().activity).toEqual([today()])
  })

  it('keeps the answers of the last 60 days only', () => {
    const daily = Object.fromEntries(
      Array.from({ length: 60 }, (_, index) => [
        `2026-0${1 + Math.floor(index / 28)}-${String((index % 28) + 1).padStart(2, '0')}`,
        { picked: 0, correct: false },
      ]),
    )
    seedUser({ daily })
    userActions.answerDaily('2026-12-01', 0, true)
    expect(Object.keys(getUser().daily ?? {})).toHaveLength(60)
    expect(getUser().daily?.['2026-12-01']).toBeDefined()
  })

  it('hides a card of the feed once, and caps the list', () => {
    seedUser()
    userActions.dismiss('career:a')
    userActions.dismiss('career:a')
    expect(getUser().dismissed).toEqual(['career:a'])

    for (let index = 0; index < 210; index += 1) userActions.dismiss(`news:${index}`)
    expect(getUser().dismissed).toHaveLength(200)
    expect(getUser().dismissed).toContain('news:209')
  })

  it('remembers when the news of the home were seen', () => {
    seedUser()
    expect(getUser().newsSeenAt ?? null).toBeNull()
    userActions.markNewsSeen()
    expect(Date.parse(getUser().newsSeenAt ?? '')).not.toBeNaN()
  })

  it('remembers the free tries of the Plus, each once', () => {
    seedUser()
    userActions.spendPlusTrial('cv_pdf')
    userActions.spendPlusTrial('cv_pdf')
    expect(getUser().plusTrials).toEqual({ cv_pdf: true })
  })

  it('cuts what an account copy brings to the sizes the app keeps', () => {
    seedUser()
    replaceUser({
      version: 1,
      activity: Array.from({ length: 80 }, (_, index) => `2026-02-${String(index + 1).padStart(3, '0')}`),
      dismissed: Array.from({ length: 250 }, (_, index) => `news:${index}`),
    })
    expect(getUser().activity).toHaveLength(60)
    expect(getUser().dismissed).toHaveLength(200)
  })

  it('opens an old copy, from before the home, without these fields', () => {
    seedUser()
    replaceUser({ version: 1, savedCareers: ['a'] })
    expect(getUser().savedCareers).toEqual(['a'])
    expect(getUser().activity ?? []).toEqual([])
  })
})
