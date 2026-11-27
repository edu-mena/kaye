import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { CheckboxField, TextField } from '../../components/ui/Field'
import { Segmented } from '../../components/ui/Segmented'
import { KURSOS } from '../../data/kursos'
import { useCareers, useCareerTraits } from '../../data/queries'
import type { MarketArea, SkillLevel } from '../../data/types'
import { newId } from '../../domain/cv'
import { areaCounts } from '../../domain/discovery'
import { byInterest } from '../../domain/interests'
import {
  areaSkills,
  DIGITAL_SKILLS,
  EXPERIENCE_KINDS,
  LANGUAGE_LEVELS,
  LANGUAGES,
  MAX_EXPERIENCE,
  MAX_TEXT,
  SOFT_LEVELS,
  SOFT_SKILLS,
  STUDY_GOALS,
  WORK_VALUES,
  type ExperienceKind,
  type LanguageId,
  type LanguageLevel,
  type WorkPrefs,
} from '../../domain/strengths'
import { useInterestAreas } from '../../lib/useInterestAreas'
import { userActions, useUser } from '../../state/userStore'

const SKILL_LEVELS: SkillLevel[] = ['aprender', 'sei', 'domino']
/** Skills shown per area before "Mostrar mais". */
const SKILLS_PAGE = 10

/** One thing to rate: its name above, the choices below (they scroll sideways on a phone). */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="border-b border-line py-3 last:border-b-0">
      <p className="mb-2 text-sm font-normal text-night">{label}</p>
      {children}
    </li>
  )
}

function useSkillOptions() {
  const { t } = useTranslation()
  return SKILL_LEVELS.map((level) => ({ value: level, label: t(`fit.level${level}`) }))
}

export function LanguagesStep() {
  const { t } = useTranslation()
  const { strengths } = useUser()
  const options = LANGUAGE_LEVELS.map((level) => ({ value: level, label: t(`strengths.level_${level}`) }))
  const other = strengths.languages.find((item) => item.id === 'other')

  const set = (id: LanguageId, level: LanguageLevel | null) => {
    const rest = strengths.languages.filter((item) => item.id !== id)
    const name = id === 'other' ? other?.name : undefined
    userActions.saveStrengths({
      languages: level ? [...rest, { id, level, ...(name ? { name } : {}) }] : rest,
    })
  }

  return (
    <ul>
      {LANGUAGES.map((id) => (
        <Row key={id} label={t(`strengths.language_${id}`)}>
          <Segmented
            label={t(`strengths.language_${id}`)}
            options={options}
            value={strengths.languages.find((item) => item.id === id)?.level ?? null}
            onChange={(level) => set(id, level)}
            clearable
          />
          {id === 'other' && other && (
            <TextField
              className="mt-3"
              label={t('strengths.otherName')}
              maxLength={30}
              value={other.name ?? ''}
              onChange={(event) =>
                userActions.saveStrengths({
                  languages: [
                    ...strengths.languages.filter((item) => item.id !== 'other'),
                    { id: 'other', level: other.level, name: event.target.value },
                  ],
                })
              }
            />
          )}
        </Row>
      ))}
    </ul>
  )
}

export function DigitalStep() {
  const { t } = useTranslation()
  const { strengths } = useUser()
  const options = useSkillOptions()

  return (
    <ul>
      {DIGITAL_SKILLS.map((id) => (
        <Row key={id} label={t(`strengths.digital_${id}`)}>
          <Segmented
            label={t(`strengths.digital_${id}`)}
            options={options}
            value={strengths.digital[id] ?? null}
            onChange={(level) => {
              const digital = { ...strengths.digital }
              if (level) digital[id] = level
              else delete digital[id]
              userActions.saveStrengths({ digital })
            }}
            clearable
          />
        </Row>
      ))}
    </ul>
  )
}

/** The skills of the person's areas, as the careers' catalogue names them: saved where the fit reads them. */
export function TradesStep() {
  const { t } = useTranslation()
  const { skills } = useUser()
  const { data: careers = [] } = useCareers()
  const { data: traits = [] } = useCareerTraits()
  const mine = useInterestAreas()
  const options = useSkillOptions()

  const areas = useMemo(
    () =>
      byInterest(
        areaCounts(careers).map((item) => item.area),
        (area) => [area],
        mine,
      ),
    [careers, mine],
  )
  const [chosen, setChosen] = useState<MarketArea | null>(null)
  const [shown, setShown] = useState(SKILLS_PAGE)
  const area = chosen ?? areas[0] ?? null
  const list = useMemo(() => (area ? areaSkills(traits, careers, area) : []), [traits, careers, area])

  if (!area) return null
  return (
    <>
      <p className="mb-2 text-sm font-light text-copy">{t('strengths.tradesArea')}</p>
      <Segmented
        label={t('strengths.tradesArea')}
        options={areas.map((value) => ({ value, label: t(`market.area_${value}`) }))}
        value={area}
        onChange={(value) => {
          setChosen(value)
          setShown(SKILLS_PAGE)
        }}
      />
      <ul className="mt-4">
        {list.slice(0, shown).map((skill) => (
          <Row key={skill.id} label={skill.name}>
            <Segmented
              label={skill.name}
              options={options}
              value={skills[skill.id] ?? null}
              onChange={(level) => userActions.setSkill(skill.id, level)}
              clearable
            />
          </Row>
        ))}
      </ul>
      {list.length > shown && (
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShown(shown + SKILLS_PAGE)}>
          <Icon name="plus" className="size-4" />
          {t('strengths.showMore', { count: list.length - shown })}
        </Button>
      )}
    </>
  )
}

export function SoftStep() {
  const { t } = useTranslation()
  const { strengths } = useUser()
  const options = SOFT_LEVELS.map((level) => ({ value: level, label: t(`strengths.soft${level}`) }))

  return (
    <ul>
      {SOFT_SKILLS.map((id) => (
        <Row key={id} label={t(`strengths.soft_${id}`)}>
          <Segmented
            label={t(`strengths.soft_${id}`)}
            options={options}
            value={strengths.soft[id] ?? null}
            onChange={(level) => {
              const soft = { ...strengths.soft }
              if (level) soft[id] = level
              else delete soft[id]
              userActions.saveStrengths({
                soft,
                softInCv: level ? strengths.softInCv : strengths.softInCv.filter((item) => item !== id),
              })
            }}
            clearable
          />
          {strengths.soft[id] && (
            <CheckboxField
              label={t('strengths.softInCv')}
              checked={strengths.softInCv.includes(id)}
              onChange={(event) =>
                userActions.saveStrengths({
                  softInCv: event.target.checked
                    ? [...strengths.softInCv, id]
                    : strengths.softInCv.filter((item) => item !== id),
                })
              }
            />
          )}
        </Row>
      ))}
    </ul>
  )
}

const EMPTY_FORM = { what: '', where: '', when: '' }

export function ExperienceStep() {
  const { t } = useTranslation()
  const { strengths, kursos } = useUser()
  const [kind, setKind] = useState<ExperienceKind>('work')
  const [form, setForm] = useState(EMPTY_FORM)
  const finished = KURSOS.filter((course) => kursos[course.id]?.certificate)
  const full = strengths.experience.length >= MAX_EXPERIENCE

  const add = () => {
    const entry = {
      id: newId(),
      kind,
      what: form.what.trim(),
      where: form.where.trim(),
      when: form.when.trim(),
    }
    if (!entry.what || full) return
    userActions.saveStrengths({ experience: [...strengths.experience, entry] })
    setForm(EMPTY_FORM)
  }
  const field = (key: keyof typeof EMPTY_FORM) => ({
    value: form[key],
    maxLength: MAX_TEXT,
    onChange: (event: { target: { value: string } }) => setForm({ ...form, [key]: event.target.value }),
  })

  return (
    <>
      {strengths.experience.length > 0 && (
        <ul className="mb-6 space-y-2">
          {strengths.experience.map((item) => (
            <li key={item.id} className="flex items-start gap-3 rounded-2xl border border-line p-3">
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted">{t(`strengths.kind_${item.kind}`)}</span>
                <span className="block text-sm font-semibold text-night">{item.what}</span>
                <span className="block text-xs font-light text-copy">
                  {[item.where, item.when].filter(Boolean).join(' · ')}
                </span>
              </span>
              <Button
                variant="danger"
                size="sm"
                aria-label={t('strengths.remove', { item: item.what })}
                onClick={() =>
                  userActions.saveStrengths({
                    experience: strengths.experience.filter((entry) => entry.id !== item.id),
                  })
                }
              >
                <Icon name="trash" className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {!full && (
        <form
          className="space-y-3 rounded-2xl bg-ash-100 p-4"
          onSubmit={(event) => {
            event.preventDefault()
            add()
          }}
        >
          <Segmented
            label={t('strengths.kindLabel')}
            options={EXPERIENCE_KINDS.map((value) => ({ value, label: t(`strengths.kind_${value}`) }))}
            value={kind}
            onChange={(value) => value && setKind(value)}
          />
          <TextField
            label={t('strengths.what')}
            placeholder={t(`strengths.whatHint_${kind}`)}
            {...field('what')}
          />
          <TextField
            label={t('strengths.where')}
            placeholder={t('strengths.whereHint')}
            {...field('where')}
          />
          <TextField label={t('strengths.when')} placeholder={t('strengths.whenHint')} {...field('when')} />
          <Button type="submit" size="sm" disabled={!form.what.trim()}>
            <Icon name="plus" className="size-4" />
            {t('strengths.add')}
          </Button>
        </form>
      )}

      {finished.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-night">{t('strengths.kursosTitle')}</p>
          <ul className="mt-2 space-y-1">
            {finished.map((course) => (
              <li key={course.id} className="flex items-center gap-2 text-sm font-light text-copy">
                <Icon name="award" className="size-4 shrink-0 text-success" />
                {course.title} · {kursos[course.id]?.certificate}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

type WorkPair = 'place' | 'company' | 'security'
/** i18next 27 cannot check a key built from a generic, so the keys are spelled out as concrete unions. */
type WorkPairKey = `strengths.work_${WorkPair}`
type WorkValueKey = `strengths.work_${NonNullable<WorkPrefs[WorkPair]>}`

export function WorkStep() {
  const { t } = useTranslation()
  const { strengths } = useUser()
  const { work } = strengths
  const save = (change: Partial<WorkPrefs>) => userActions.saveStrengths({ work: { ...work, ...change } })
  const pair = <K extends WorkPair>(key: K, values: NonNullable<WorkPrefs[K]>[]) => (
    <Row label={t(`strengths.work_${key}` as WorkPairKey)}>
      <Segmented
        label={t(`strengths.work_${key}` as WorkPairKey)}
        options={values.map((value) => ({ value, label: t(`strengths.work_${value}` as WorkValueKey) }))}
        value={work[key]}
        onChange={(value) => save({ [key]: value } as Partial<WorkPrefs>)}
        clearable
      />
    </Row>
  )

  return (
    <ul>
      {pair('place', ['office', 'field'])}
      {pair('company', ['alone', 'team'])}
      {pair('security', ['stable', 'risk'])}
      <Row label={t('strengths.work_values')}>
        <div className="space-y-1">
          {WORK_VALUES.map((value) => (
            <CheckboxField
              key={value}
              label={t(`strengths.work_${value}`)}
              checked={work.values.includes(value)}
              onChange={(event) =>
                save({
                  values: event.target.checked
                    ? [...work.values, value]
                    : work.values.filter((item) => item !== value),
                })
              }
            />
          ))}
        </div>
      </Row>
    </ul>
  )
}

type YesNo = 'yes' | 'no'
const toYesNo = (value: boolean | null): YesNo | null => (value === null ? null : value ? 'yes' : 'no')

export function ConditionsStep() {
  const { t } = useTranslation()
  const { strengths } = useUser()
  const { conditions } = strengths
  const yesNo = [
    { value: 'yes' as const, label: t('strengths.yes') },
    { value: 'no' as const, label: t('strengths.no') },
  ]
  const save = (change: Partial<typeof conditions>) =>
    userActions.saveStrengths({ conditions: { ...conditions, ...change } })

  return (
    <ul>
      <Row label={t('strengths.studyLabel')}>
        <Segmented
          label={t('strengths.studyLabel')}
          options={STUDY_GOALS.map((value) => ({ value, label: t(`strengths.study_${value}`) }))}
          value={conditions.study}
          onChange={(study) => save({ study })}
          clearable
        />
      </Row>
      <Row label={t('strengths.moveLabel')}>
        <Segmented
          label={t('strengths.moveLabel')}
          options={yesNo}
          value={toYesNo(conditions.move)}
          onChange={(value) => save({ move: value === null ? null : value === 'yes' })}
          clearable
        />
      </Row>
      <Row label={t('strengths.workNowLabel')}>
        <Segmented
          label={t('strengths.workNowLabel')}
          options={yesNo}
          value={toYesNo(conditions.workNow)}
          onChange={(value) => save({ workNow: value === null ? null : value === 'yes' })}
          clearable
        />
      </Row>
    </ul>
  )
}
