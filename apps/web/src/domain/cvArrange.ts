import type { CvArrangement, CvFormat, CvSection, CvTemplate } from '../data/types'

// Where each section goes and how it is written. The template gives the defaults; the person's
// arrangement (what they moved, hid or rewrote) wins. The preview and the PDF read it from here.

const STORY: CvSection[] = ['summary', 'experience', 'projects', 'education']

type Flow = { main: CvSection[]; side: CvSection[] }

const ONE_COLUMN: Flow = {
  main: [...STORY, 'certifications', 'skills', 'languages'],
  side: [],
}
const TWO_COLUMNS: Flow = { main: STORY, side: ['links', 'skills', 'languages', 'certifications'] }

const FLOWS: Record<CvTemplate, Flow> = {
  classico: ONE_COLUMN,
  moderno: TWO_COLUMNS,
  europeu: { main: [...ONE_COLUMN.main, 'links'], side: [] },
  retrato: TWO_COLUMNS,
  colunas: TWO_COLUMNS,
  minimalista: ONE_COLUMN,
  criativo: { main: [...ONE_COLUMN.main, 'links'], side: [] },
  // The summary is the box under the name, so it is not in the flow.
  destaque: {
    main: ['skills', 'experience', 'projects', 'education', 'certifications', 'languages', 'links'],
    side: [],
  },
}

/** The models with a narrow column beside the main one. */
export const SIDE_TEMPLATES: CvTemplate[] = ['moderno', 'retrato', 'colunas']

/** The sections that fit a narrow column: short lists, never a story. */
export const SIDE_SECTIONS: CvSection[] = ['links', 'skills', 'languages', 'certifications']

export const ALL_SECTIONS: CvSection[] = [
  'summary',
  'experience',
  'projects',
  'education',
  'certifications',
  'skills',
  'languages',
  'links',
]

/** The models that write the links under the name, in one line: they can only show or hide them. */
export function linksInHeader(template: CvTemplate): boolean {
  return ['classico', 'minimalista', 'destaque'].includes(template)
}

/** The sections the model fixes in place: the person can still hide them. */
export function fixedSections(template: CvTemplate): CvSection[] {
  if (template === 'destaque') return ['summary', 'links']
  return linksInHeader(template) ? ['links'] : []
}

function baseFlow(template: CvTemplate): Flow {
  const flow = FLOWS[template]
  return { main: [...flow.main], side: [...flow.side] }
}

/** Where each section goes for this CV: `main` and `side` in order, hidden ones left out. */
export function resolveSections(template: CvTemplate, arrangement: CvArrangement = {}): Flow {
  const base = baseFlow(template)
  const hidden = new Set(arrangement.hidden ?? [])
  const known = [...base.main, ...base.side]
  const wanted = (arrangement.order ?? []).filter((section) => known.includes(section))
  const ordered = [...new Set([...wanted, ...known])].filter((section) => !hidden.has(section))
  if (!SIDE_TEMPLATES.includes(template)) {
    return { main: ordered, side: [] }
  }
  const side = new Set((arrangement.side ?? base.side).filter((section) => SIDE_SECTIONS.includes(section)))
  return {
    main: ordered.filter((section) => !side.has(section)),
    side: ordered.filter((section) => side.has(section)),
  }
}

/** The ways one section can be written. */
export function formatOptions(section: CvSection, side: boolean): CvFormat[] {
  if (section === 'summary') return []
  if (section === 'skills' || section === 'languages' || section === 'links')
    return side ? ['list', 'bullets', 'chips', 'comma'] : ['comma', 'list', 'bullets', 'chips']
  if (section === 'certifications' && side) return ['list', 'bullets']
  return ['full', 'compact']
}

/** How the section is written now: the person's choice, or what the model does by itself. */
export function effectiveFormat(
  template: CvTemplate,
  section: CvSection,
  side: boolean,
  arrangement: CvArrangement = {},
): CvFormat | null {
  const options = formatOptions(section, side)
  const chosen = arrangement.formats?.[section]
  if (chosen && options.includes(chosen)) return chosen
  if (options.length === 0) return null
  if (side) return 'list'
  const chips = ['criativo', 'destaque'].includes(template) && section === 'skills'
  return chips ? 'chips' : (options[0] ?? null)
}

/** Moves a section one place up or down in the order the person sees. */
export function moveSection(
  template: CvTemplate,
  arrangement: CvArrangement,
  section: CvSection,
  step: -1 | 1,
): CvArrangement {
  const { main, side } = resolveSections(template, arrangement)
  const column = side.includes(section) ? side : main
  const index = column.indexOf(section)
  const target = index + step
  if (index < 0 || target < 0 || target >= column.length) return arrangement
  const moved = [...column]
  moved.splice(index, 1)
  moved.splice(target, 0, section)
  const others = (column === main ? side : main).filter((item) => !moved.includes(item))
  // The side column keeps its own order inside the full order.
  const order = column === main ? [...moved, ...others] : [...others, ...moved]
  return { ...arrangement, order }
}

/** Shows or hides a section. */
export function toggleHidden(arrangement: CvArrangement, section: CvSection, hide: boolean): CvArrangement {
  const hidden = (arrangement.hidden ?? []).filter((item) => item !== section)
  return { ...arrangement, hidden: hide ? [...hidden, section] : hidden }
}

/** Sends a short list to the side column, or back to the main one. */
export function placeSection(
  template: CvTemplate,
  arrangement: CvArrangement,
  section: CvSection,
  to: 'main' | 'side',
): CvArrangement {
  if (!SIDE_TEMPLATES.includes(template) || !SIDE_SECTIONS.includes(section)) return arrangement
  const current = new Set(resolveSections(template, arrangement).side)
  if (to === 'side') current.add(section)
  else current.delete(section)
  return { ...arrangement, side: [...current] }
}

export function setFormat(arrangement: CvArrangement, section: CvSection, format: CvFormat): CvArrangement {
  return { ...arrangement, formats: { ...arrangement.formats, [section]: format } }
}
