import { describe, expect, it } from 'vitest'
import type { CvSection } from '../data/types'
import {
  effectiveFormat,
  formatOptions,
  linksInHeader,
  moveSection,
  placeSection,
  resolveSections,
  setFormat,
  toggleHidden,
} from './cvArrange'

describe('resolveSections', () => {
  it('gives each model its own order until the person changes it', () => {
    expect(resolveSections('classico').main).toEqual([
      'summary',
      'experience',
      'projects',
      'education',
      'certifications',
      'skills',
      'languages',
    ])
    expect(resolveSections('moderno')).toEqual({
      main: ['summary', 'experience', 'projects', 'education'],
      side: ['links', 'skills', 'languages', 'certifications'],
    })
    // The summary is the box under the name, so it is not part of the flow.
    expect(resolveSections('destaque').main[0]).toBe('skills')
  })

  it('follows the order the person chose and keeps the sections they left out', () => {
    const { main } = resolveSections('classico', { order: ['skills', 'education'] })
    expect(main.slice(0, 2)).toEqual(['skills', 'education'])
    expect(main).toHaveLength(7)
  })

  it('leaves hidden sections out, and ignores sections the model does not have', () => {
    const { main } = resolveSections('classico', { hidden: ['projects'], order: ['links' as CvSection] })
    expect(main).not.toContain('projects')
    expect(main).not.toContain('links')
  })

  it('moves short lists between the columns of the models that have two', () => {
    const arrangement = placeSection('moderno', {}, 'skills', 'main')
    expect(resolveSections('moderno', arrangement).main).toContain('skills')
    expect(resolveSections('moderno', arrangement).side).not.toContain('skills')
    const back = placeSection('moderno', arrangement, 'skills', 'side')
    expect(resolveSections('moderno', back).side).toContain('skills')
  })

  it('never puts a story in a narrow column, nor a side column in a one-column model', () => {
    expect(placeSection('moderno', {}, 'experience', 'side')).toEqual({})
    expect(placeSection('classico', {}, 'skills', 'side')).toEqual({})
    expect(resolveSections('classico', { side: ['skills'] }).side).toEqual([])
    expect(resolveSections('moderno', { side: ['experience', 'skills'] }).side).toEqual(['skills'])
  })
})

describe('changes', () => {
  it('moves a section one place up or down, and stops at the ends', () => {
    const down = moveSection('classico', {}, 'summary', 1)
    expect(resolveSections('classico', down).main.slice(0, 2)).toEqual(['experience', 'summary'])
    const up = moveSection('classico', down, 'summary', -1)
    expect(resolveSections('classico', up).main[0]).toBe('summary')
    expect(moveSection('classico', {}, 'summary', -1)).toEqual({})
    expect(moveSection('classico', {}, 'languages', 1)).toEqual({})
    expect(moveSection('classico', {}, 'links', 1)).toEqual({})
  })

  it('moves inside the side column on its own', () => {
    const next = moveSection('moderno', {}, 'links', 1)
    expect(resolveSections('moderno', next).side.slice(0, 2)).toEqual(['skills', 'links'])
    expect(resolveSections('moderno', next).main).toEqual(resolveSections('moderno').main)
  })

  it('hides and shows a section again', () => {
    const hidden = toggleHidden({}, 'skills', true)
    expect(resolveSections('classico', hidden).main).not.toContain('skills')
    expect(toggleHidden(toggleHidden(hidden, 'skills', true), 'skills', false).hidden).toEqual([])
  })
})

describe('formats', () => {
  it('offers lists several ways and stories two', () => {
    expect(formatOptions('summary', false)).toEqual([])
    expect(formatOptions('skills', false)).toEqual(['comma', 'list', 'bullets', 'chips'])
    expect(formatOptions('experience', false)).toEqual(['full', 'compact'])
    expect(formatOptions('certifications', true)).toEqual(['list', 'bullets'])
  })

  it('reads the choice of the person, or what the model does by itself', () => {
    expect(effectiveFormat('classico', 'skills', false)).toBe('comma')
    expect(effectiveFormat('criativo', 'skills', false)).toBe('chips')
    expect(effectiveFormat('moderno', 'skills', true)).toBe('list')
    expect(effectiveFormat('classico', 'summary', false)).toBeNull()
    const chosen = setFormat({}, 'skills', 'bullets')
    expect(effectiveFormat('classico', 'skills', false, chosen)).toBe('bullets')
    // A choice that does not exist for that section is ignored.
    expect(effectiveFormat('classico', 'experience', false, setFormat({}, 'experience', 'chips'))).toBe(
      'full',
    )
  })

  it('knows which models write the links under the name', () => {
    expect(linksInHeader('classico')).toBe(true)
    expect(linksInHeader('europeu')).toBe(false)
  })
})
