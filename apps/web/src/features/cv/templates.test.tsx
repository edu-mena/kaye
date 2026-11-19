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
