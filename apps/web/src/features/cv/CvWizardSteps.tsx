import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import { TextAreaField, TextField } from '../../components/ui/Field'
import type { CvDocument, CvEntry, CvTemplate } from '../../data/types'
import { newEntry, parseList } from '../../domain/cv'
import { userActions, useUser } from '../../state/userStore'
import { CvArrangePanel } from './CvArrangePanel'
import { ScaledSheet } from './CvSheet'
import { EntryList, ListField } from './cvFields'
import { CvDownloadButton } from './CvDownloadButton'
import { downloadCvPdf } from './cvPdf'
import { useCareerTips } from './useCareerTips'
import { useCvLabels } from './useCvLabels'
import { useCvSuggestions } from './useCvSuggestions'
import type { Step } from './wizardFlow'

/** The four models shown at the end: one column, two columns, boxed summary and colour. */
const SHOWN_TEMPLATES: CvTemplate[] = ['classico', 'moderno', 'destaque', 'criativo']
const IDEA_KINDS = ['school', 'volunteer', 'informal', 'course'] as const
const LANGUAGES = ['pt', 'en', 'fr', 'umbundu', 'kimbundu', 'kikongo'] as const

type Idea = { key: string; label: string; apply: () => void }

/** One-tap suggestions: each adds something to the CV and goes away once it is there. */
function Ideas({ title, ideas }: { title: string; ideas: Idea[] }) {
  const { t } = useTranslation()
  if (ideas.length === 0) return null
  return (
    <section aria-label={title} className="space-y-2">
      <h2 className="text-sm font-semibold text-night">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {ideas.map((idea) => (
          <li key={idea.key}>
            <button
              type="button"
              aria-label={t('cv.wizAdd', { what: idea.label })}
              onClick={idea.apply}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-left text-sm font-light text-night hover:border-ash-300 hover:bg-ash-100"
            >
              <Icon name="plus" className="size-3.5 shrink-0" />
              {idea.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

type BodyProps = { document: CvDocument }

function TextStep({ document, field }: BodyProps & { field: 'name' | 'headline' }) {
  const { t } = useTranslation()
  const { cv } = document
  return (
    <TextField
      label={t(`cv.${field}`)}
      placeholder={field === 'headline' ? t('cv.headlinePlaceholder') : undefined}
      value={cv[field]}
      onChange={(event) => userActions.updateCv({ ...cv, [field]: event.target.value })}
    />
  )
}

function ContactStep({ document }: BodyProps) {
  const { t } = useTranslation()
  const { cv } = document
  return (
    <div className="space-y-4">
      <TextField
        label={t('cv.contact')}
        placeholder={t('cv.contactPlaceholder')}
        value={cv.contact}
        onChange={(event) => userActions.updateCv({ ...cv, contact: event.target.value })}
      />
      <TextField
        label={t('cv.links')}
        hint={t('cv.linksPlaceholder')}
        defaultValue={cv.links.join(', ')}
        onChange={(event) => userActions.updateCv({ ...cv, links: parseList(event.target.value) })}
      />
    </div>
  )
}

/** The summary: the app's own sentence about the person's career is one tap away. */
function SummaryStep({ document }: BodyProps) {
  const { t } = useTranslation()
  const { cv } = document
  const proposal = useCvSuggestions(cv, document.target).find((item) => item.field === 'summary')
  const ideas = proposal
    ? [
        {
          key: 'objective',
          label: proposal.value,
          apply: () => userActions.updateCv({ ...cv, summary: proposal.value }),
        },
      ]
    : []
  return (
    <div className="space-y-4">
      <TextAreaField
        label={t('cv.summary')}
        placeholder={t('cv.summaryPlaceholder')}
        rows={4}
        value={cv.summary}
        onChange={(event) => userActions.updateCv({ ...cv, summary: event.target.value })}
      />
      <Ideas title={t('cv.wizIdeas')} ideas={ideas} />
    </div>
  )
}

/** Experience for someone with none: school projects, volunteering, informal work, from the career's models. */
function ExperienceStep({ document }: BodyProps) {
  const { t } = useTranslation()
  const { cv } = document
  const { entries, career } = useCareerTips(cv, document.target)
  const area = career ?? t('cv.wizCareerFallback')
  const has = (title: string) =>
    [...cv.experience, ...cv.projects].some(
      (entry) => entry.title.trim().toLowerCase() === title.toLowerCase(),
    )
  const add = (field: 'experience' | 'projects', entry: Pick<CvEntry, 'title' | 'description'>) =>
    userActions.updateCv({ ...cv, [field]: [...cv[field], { ...newEntry(), ...entry }] })

  const generic = IDEA_KINDS.map((kind) => ({
    title: t(`cv.wizIdea_${kind}`),
    description: t(`cv.wizIdea_${kind}Body`, { career: area }),
    field: 'experience' as const,
  }))
  const ideas = [...generic, ...entries.slice(0, 3)]
    .filter((idea) => !has(idea.title))
    .map((idea) => ({ key: idea.title, label: idea.title, apply: () => add(idea.field, idea) }))

  return (
    <div className="space-y-5">
      <Ideas title={t('cv.wizIdeas')} ideas={ideas} />
      <EntryList
        section="experience"
        entries={cv.experience}
        onChange={(experience) => userActions.updateCv({ ...cv, experience })}
      />
    </div>
  )
}

type ListStepProps = BodyProps & {
  field: 'skills' | 'languages'
  /** What is offered with one tap. */
  offered: string[]
  title: string
}

/** A typed list with the offered items one tap away; a tap changes the list from outside, so the field reloads. */
function ListStep({ document, field, offered, title }: ListStepProps) {
  const { t } = useTranslation()
  const { cv } = document
  const [reload, setReload] = useState(0)
  const ideas = offered
    .filter((item) => !cv[field].includes(item))
    .map((item) => ({
      key: item,
      label: item,
      apply: () => {
        userActions.updateCv({ ...cv, [field]: [...cv[field], item] })
        setReload((count) => count + 1)
      },
    }))
  return (
    <div className="space-y-4">
      <Ideas title={title} ideas={ideas} />
      <ListField
        key={reload}
        label={t(`cv.${field}`)}
        items={cv[field]}
        onChange={(items) => userActions.updateCv({ ...cv, [field]: items })}
      />
    </div>
  )
}

function SkillsStep({ document }: BodyProps) {
  const { t } = useTranslation()
  const { skills } = useCareerTips(document.cv, document.target)
  return (
    <ListStep
      document={document}
      field="skills"
      offered={skills.slice(0, 8)}
      title={t('cv.wizIdeasCareer')}
    />
  )
}

function LanguagesStep({ document }: BodyProps) {
  const { t } = useTranslation()
  const offered = LANGUAGES.map((id) => t(`cv.wizLang_${id}`))
  return <ListStep document={document} field="languages" offered={offered} title={t('cv.wizIdeas')} />
}

/** Three or four real previews of the person's own CV: choosing is looking, not guessing. */
function TemplateStep({ document }: BodyProps) {
  const { t } = useTranslation()
  const { photo } = useUser()
  const { sample } = useCareerTips(document.cv, document.target)
  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-2 gap-3">
        {SHOWN_TEMPLATES.map((template) => (
          <li key={template}>
            <button
              type="button"
              aria-pressed={document.template === template}
              onClick={() => userActions.setCvTemplate(template)}
              className="w-full rounded-xl border-2 border-transparent p-1 text-center aria-pressed:border-night"
            >
              <span aria-hidden="true" className="block overflow-hidden rounded-lg border border-line">
                <ScaledSheet
                  cv={document.cv}
                  template={template}
                  style={document.style}
                  photo={photo}
                  arrangement={document.arrangement}
                  sample={sample}
                />
              </span>
              <span className="mt-1.5 block text-sm font-normal text-night">
                {t(`cv.template_${template}`)}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-sm font-light text-copy">{t('cv.wizTemplateBody')}</p>
      <ButtonLink to="/cv/editar" variant="ghost" size="sm">
        {t('cv.wizMoreTemplates')}
      </ButtonLink>
    </div>
  )
}

function DoneStep({ document }: BodyProps) {
  const { t } = useTranslation()
  const { photo } = useUser()
  const labels = useCvLabels()
  const { cv, template, style, arrangement } = document
  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-light text-copy">{t('cv.wizDoneBody')}</p>
      <CvDownloadButton
        size="lg"
        className="w-full"
        onDownload={() => void downloadCvPdf({ cv, template, style, photo, arrangement }, labels)}
      />
      <div className="flex flex-wrap justify-center gap-2">
        <ButtonLink to="/cv/cartao" variant="secondary" size="sm">
          {t('cv.wizCard')}
        </ButtonLink>
        <ButtonLink to="/cv/editar" variant="ghost" size="sm">
          {t('cv.wizEditAll')}
        </ButtonLink>
      </div>
    </div>
  )
}

const BODIES: Record<Step, (props: BodyProps) => ReactNode> = {
  name: (props) => <TextStep {...props} field="name" />,
  headline: (props) => <TextStep {...props} field="headline" />,
  contact: ContactStep,
  summary: SummaryStep,
  education: ({ document }) => (
    <EntryList
      section="education"
      entries={document.cv.education}
      onChange={(education) => userActions.updateCv({ ...document.cv, education })}
    />
  ),
  experience: ExperienceStep,
  skills: SkillsStep,
  languages: LanguagesStep,
  arrange: ({ document }) => <CvArrangePanel document={document} />,
  template: TemplateStep,
  done: DoneStep,
}

export function StepBody({ step, document }: { step: Step; document: CvDocument }) {
  const Body = BODIES[step]
  return <Body document={document} />
}
