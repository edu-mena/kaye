import { render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CV_EXAMPLES } from '../../data/demo/cvExamples'
import type { CvData, CvTemplate } from '../../data/types'
import { CV_TEMPLATES } from '../../domain/cvStyle'
import { EMPTY_CV } from '../../state/userStore'
import { ScaledSheet } from './CvSheet'
import { downloadCvPdf, type CvLabels } from './cvPdf'

// Every model the gallery offers.
const TEMPLATES: CvTemplate[] = CV_TEMPLATES

// A CV with every section filled, so each layout draws all of its parts.
const FULL: CvData = {
  ...CV_EXAMPLES.find((example) => example.id === 'dados-reconversao')!.cv,
  links: ['github.com/exemplo'],
  projects: CV_EXAMPLES[0]!.cv.projects,
}

const LABELS: CvLabels = {
  summary: 'Resumo',
  experience: 'Experiência',
  education: 'Formação',
  projects: 'Projetos',
  certifications: 'Certificações',
  skills: 'Competências',
  languages: 'Línguas',
  links: 'Links',
}

// The sheet is drawn in SVG from the same layout as the PDF: its words are the <text> elements.
const words = (container: HTMLElement) =>
  [...container.querySelectorAll('text')].map((text) => text.textContent ?? '')

describe('CV layouts', () => {
  it.each(TEMPLATES)('the %s sheet shows every filled section, and skips empty ones', (template) => {
    const { container } = render(<ScaledSheet cv={FULL} template={template} fit="content" />)
    // Some models write the section titles in capitals, others as they are.
    const full = words(container).map((word) => word.toLowerCase())
    expect(full).toContain(FULL.name.toLowerCase())
    for (const label of ['Experiência', 'Formação', 'Competências', 'Línguas', 'Certificações']) {
      expect(full).toContain(label.toLowerCase())
    }
    expect(full).toContain('power bi data analyst')

    const { container: empty } = render(<ScaledSheet cv={{ ...EMPTY_CV, name: 'Ana' }} template={template} />)
    expect(words(empty).map((word) => word.toLowerCase())).not.toContain('experiência')
    expect(words(empty)).toContain('Ainda vazio')
  })

  it.each(TEMPLATES)('the %s PDF is a real PDF file, named after the person', async (template) => {
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:kaye')
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn<(url: string) => void>() }),
    )
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    await downloadCvPdf({ cv: FULL, template }, LABELS)

    await waitFor(() => expect(createObjectURL).toHaveBeenCalledTimes(1))
    const pdf = createObjectURL.mock.calls[0]![0]
    expect(pdf.type).toBe('application/pdf')
    expect(pdf.size).toBeGreaterThan(1000)
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('names the file without accents or spaces, and has a fallback', async () => {
    const names: string[] = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      names.push(this.download)
    })
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL: () => 'blob:kaye', revokeObjectURL: () => {} }),
    )
    await downloadCvPdf({ cv: { ...EMPTY_CV, name: 'Délcio Neto' }, template: 'classico' }, LABELS)
    await downloadCvPdf({ cv: EMPTY_CV, template: 'europeu' }, LABELS)
    expect(names).toEqual(['cv-delcio-neto.pdf', 'cv-kaye.pdf'])
  })
})

const lower = (container: HTMLElement) => words(container).map((word) => word.toLowerCase())
const fillOf = (container: HTMLElement, word: string) =>
  [...container.querySelectorAll('text')]
    .find((text) => text.textContent?.toLowerCase() === word)
    ?.getAttribute('fill')

describe('CV arrangement', () => {
  it('writes the sections in the order the person chose', () => {
    const { container } = render(
      <ScaledSheet cv={FULL} template="classico" fit="content" arrangement={{ order: ['skills'] }} />,
    )
    const list = lower(container)
    expect(list.indexOf('competências')).toBeLessThan(list.indexOf('experiência'))
  })

  it('leaves out the sections the person hid, in every model', () => {
    for (const template of TEMPLATES) {
      const { container } = render(
        <ScaledSheet
          cv={FULL}
          template={template}
          fit="content"
          arrangement={{ hidden: ['skills', 'languages', 'summary'] }}
        />,
      )
      const list = lower(container)
      expect(list).not.toContain('competências')
      expect(list).not.toContain('línguas')
      expect(list).toContain('experiência')
    }
  })

  it('writes the same list as commas, lines with dots, or labels', () => {
    const shapes = (format: 'comma' | 'bullets' | 'chips') => {
      const { container } = render(
        <ScaledSheet
          cv={FULL}
          template="classico"
          fit="content"
          arrangement={{ formats: { skills: format } }}
        />,
      )
      return { rects: container.querySelectorAll('rect').length, words: words(container) }
    }
    const comma = shapes('comma')
    const bullets = shapes('bullets')
    const chips = shapes('chips')
    expect(comma.words).toContain(FULL.skills.join(', '))
    expect(bullets.words).toEqual(expect.arrayContaining(FULL.skills))
    expect(bullets.rects).toBe(comma.rects + FULL.skills.length)
    expect(chips.words).toEqual(expect.arrayContaining(FULL.skills))
    expect(chips.rects).toBeGreaterThan(comma.rects)
  })

  it('writes experience on one line each when the person wants it compact', () => {
    const description = FULL.experience[0]!.description.split(' ').slice(0, 3).join(' ')
    const full = render(<ScaledSheet cv={FULL} template="classico" fit="content" />)
    expect(words(full.container).some((word) => word.includes(description))).toBe(true)
    const compact = render(
      <ScaledSheet
        cv={FULL}
        template="classico"
        fit="content"
        arrangement={{ formats: { experience: 'compact' } }}
      />,
    )
    expect(words(compact.container).some((word) => word.includes(description))).toBe(false)
  })

  it('moves a short list from the side column to the main one', () => {
    const { container } = render(
      <ScaledSheet cv={FULL} template="moderno" fit="content" arrangement={{ side: ['languages'] }} />,
    )
    const title = [...container.querySelectorAll('text')].find((text) => text.textContent === 'COMPETÊNCIAS')
    // In the main column the title starts to the right of the band (66 mm).
    expect(Number(title?.getAttribute('x'))).toBeGreaterThan(66)
  })

  it('shows a faded example where the CV is still empty, and only when asked for', () => {
    const own = { ...EMPTY_CV, name: 'Ana' }
    const empty = render(<ScaledSheet cv={own} template="classico" fit="content" />)
    expect(lower(empty.container)).not.toContain('experiência')

    const full = render(<ScaledSheet cv={own} template="classico" fit="content" sample={FULL} />)
    expect(lower(full.container)).toContain('experiência')
    expect(words(full.container)).toContain('Ana')
    const real = render(<ScaledSheet cv={FULL} template="classico" fit="content" />)
    // The example is washed out; the person's own words are not.
    expect(fillOf(full.container, 'experiência')).not.toBe(fillOf(real.container, 'experiência'))
    expect(fillOf(full.container, 'ana')).toBe(fillOf(real.container, FULL.name.toLowerCase()))

    const off = render(
      <ScaledSheet
        cv={own}
        template="classico"
        fit="content"
        sample={FULL}
        arrangement={{ sample: false }}
      />,
    )
    expect(lower(off.container)).not.toContain('experiência')
  })

  it('does not fill with the example what the person hid, nor what they already wrote', () => {
    const own = { ...EMPTY_CV, name: 'Ana', skills: ['Excel'] }
    const { container } = render(
      <ScaledSheet
        cv={own}
        template="classico"
        fit="content"
        sample={FULL}
        arrangement={{ hidden: ['education'] }}
      />,
    )
    expect(lower(container)).not.toContain('formação')
    // The example is drawn, never written into the person's own CV.
    expect(own).toEqual({ ...EMPTY_CV, name: 'Ana', skills: ['Excel'] })
    expect(words(container)).toContain('Excel')
    expect(words(container)).not.toContain(FULL.skills[0])
  })

  it('keeps the example out of the PDF', async () => {
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:kaye')
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn<(url: string) => void>() }),
    )
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await downloadCvPdf(
      { cv: { ...EMPTY_CV, name: 'Ana' }, template: 'classico', arrangement: { order: ['skills'] } },
      LABELS,
    )
    await waitFor(() => expect(createObjectURL).toHaveBeenCalledTimes(1))
    const text = await createObjectURL.mock.calls[0]![0].text()
    expect(text).not.toContain(FULL.skills[0]!)
  })
})
