import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router'
import { CareerCard } from '../../components/CareerCard'
import { Icon } from '../../components/icons'
import { BarList } from '../../components/ui/BarList'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { Hexagon } from '../../components/ui/Hexagon'
import { SectionHeading } from '../../components/ui/PageHeader'
import { KURSOS } from '../../data/kursos'
import { useSkills } from '../../data/queries'
import type { SkillLevel } from '../../data/types'
import { applyCvSuggestions } from '../../domain/cvFill'
import { isMinor } from '../../domain/education'
import { rankDimensions, riasecCode } from '../../domain/riasec'
import { DIGITAL_SKILLS, hasStrengths, SOFT_SKILLS } from '../../domain/strengths'
import { stagger } from '../../lib/ui'
import { useRecommendations } from '../../lib/useRecommendations'
import { useRiasecProfile } from '../../state/useRiasecProfile'
import { activeCv, EMPTY_CV, getUser, userActions, useUser } from '../../state/userStore'
import { CvFillDialog } from '../cv/CvFillPanel'
import { useCvSuggestions } from '../cv/useCvSuggestions'
import { ClearStrengths } from './ClearStrengths'
import { useTestProgress } from '../../state/useTestProgress'

const LEVELS: SkillLevel[] = ['domino', 'sei', 'aprender']

export default function ResultPage() {
  const { t } = useTranslation()
  const { profile, completed } = useRiasecProfile()
  const { strengthsDone } = useTestProgress()
  const user = useUser()
  const recommendations = useRecommendations(6)

  if (!completed) return <Navigate to="/teste" replace />
  if (!profile) return null

  const ranked = rankDimensions(profile)
  const top = ranked.slice(0, 3)
  const code = riasecCode(profile)
  const minor = user.profile ? isMinor(user.profile.birthYear) : false

  return (
    <div className="space-y-10">
      <header className="flex rise flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Hexagon size="lg">{code}</Hexagon>
        <div>
          <h1 className="text-3xl leading-tight font-extrabold text-night sm:text-4xl">
            {t('assessment.resultTitle', { code })}
          </h1>
          <p className="mt-2 text-sm font-light text-copy">{t('assessment.resultBody')}</p>
        </div>
      </header>

      {!strengthsDone && (
        <Card tone="coal" className="flex flex-wrap items-center gap-4 p-6">
          <div className="min-w-0 flex-1 basis-60">
            <h2 className="text-lg font-extrabold">{t('assessment.completeStrengths')}</h2>
            <p className="mt-1 text-sm font-light text-white/80">{t('assessment.completeStrengthsBody')}</p>
          </div>
          <ButtonLink to="/teste/valencias" variant="onDark">
            {t('assessment.completeStrengthsCta')}
            <Icon name="arrowRight" className="size-4" />
          </ButtonLink>
        </Card>
      )}

      <section aria-labelledby="top-dimensions" className="space-y-3">
        <h2 id="top-dimensions" className="sr-only">
          {t('assessment.resultBody')}
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {top.map((key, index) => (
            <li key={key} className="rise" style={stagger(index + 1)}>
              <Card className="h-full p-6">
                <span className="flex items-center gap-3">
                  <Hexagon size="sm" tone={index === 0 ? 'dark' : 'gold'}>
                    {key}
                  </Hexagon>
                  <span className="text-base font-semibold text-night">{t(`riasec.${key}`)}</span>
                </span>
                <p className="mt-2 text-xs font-light text-muted">{t(`riasec.${key}Body`)}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="all-dimensions">
        <SectionHeading id="all-dimensions" title={t('assessment.scoresLabel')} icon="chart" />
        <Card>
          <BarList
            label={t('assessment.scoresLabel')}
            items={ranked.map((key) => ({
              label: t(`riasec.${key}`),
              value: profile[key],
              valueLabel: String(Math.round(profile[key] * 100)),
              emphasized: top.includes(key),
            }))}
          />
        </Card>
      </section>

      <section aria-labelledby="recommendations">
        <SectionHeading id="recommendations" title={t('assessment.recommendations')} icon="compass" />
        <p className="-mt-2 mb-4 text-sm font-light text-copy">{t('assessment.recommendationsBody')}</p>
        <ul className="grid gap-4 lg:grid-cols-2">
          {recommendations?.map((item, index) => (
            <li key={item.career.slug} className="rise" style={stagger(index)}>
              <CareerCard career={item.career} match={item.match} reasons={item.reasons} hideSalary={minor} />
            </li>
          ))}
        </ul>
      </section>

      <StrengthsSummary />
      <ToCv />

      <div className="flex flex-wrap gap-2">
        <ButtonLink to="/teste" variant="secondary">
          {t('assessment.restart')}
        </ButtonLink>
        {hasStrengths(user.strengths) && <ClearStrengths />}
      </div>
    </div>
  )
}

/** "As tuas valências": languages, skills by level and what the person has done, at a glance. */
function StrengthsSummary() {
  const { t } = useTranslation()
  const { strengths, skills, kursos } = useUser()
  const { data: catalogue = [] } = useSkills()

  const named: { name: string; level: SkillLevel }[] = [
    ...DIGITAL_SKILLS.flatMap((id) => {
      const level = strengths.digital[id]
      return level ? [{ name: t(`strengths.digital_${id}`), level }] : []
    }),
    ...catalogue.flatMap((skill) => {
      const level = skills[skill.id]
      return level ? [{ name: skill.name, level }] : []
    }),
  ]
  const soft = SOFT_SKILLS.filter((id) => strengths.soft[id] === '3')
  const finished = KURSOS.filter((course) => kursos[course.id]?.certificate)
  const empty =
    strengths.languages.length === 0 &&
    named.length === 0 &&
    soft.length === 0 &&
    strengths.experience.length === 0 &&
    finished.length === 0
  if (empty) return null

  return (
    <section aria-labelledby="strengths">
      <SectionHeading id="strengths" title={t('strengths.summaryTitle')} icon="award" />
      <div className="grid gap-4 md:grid-cols-2">
        {strengths.languages.length > 0 && (
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-night">{t('strengths.step_languages')}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {strengths.languages.map((language) => (
                <li key={language.id}>
                  <Chip
                    tone={language.level === 'native' || language.level === 'fluent' ? 'night' : 'neutral'}
                  >
                    {language.id === 'other'
                      ? language.name || t('strengths.language_other')
                      : t(`strengths.language_${language.id}`)}{' '}
                    · {t(`strengths.level_${language.level}`)}
                  </Chip>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {(named.length > 0 || soft.length > 0) && (
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-night">{t('strengths.skillsTitle')}</h3>
            {LEVELS.map((level) => {
              const list = named.filter((item) => item.level === level)
              return list.length === 0 ? null : (
                <div key={level} className="mt-3">
                  <p className="text-xs font-light text-muted">{t(`fit.level${level}`)}</p>
                  <ul className="mt-1 flex flex-wrap gap-1.5">
                    {list.map((item) => (
                      <li key={item.name}>
                        <Chip tone={level === 'domino' ? 'night' : 'neutral'}>{item.name}</Chip>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
            {soft.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-light text-muted">{t('strengths.softStrong')}</p>
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {soft.map((id) => (
                    <li key={id}>
                      <Chip tone="gold">{t(`strengths.soft_${id}`)}</Chip>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}
        {(strengths.experience.length > 0 || finished.length > 0) && (
          <Card className="p-6 md:col-span-2">
            <h3 className="text-sm font-semibold text-night">{t('strengths.step_experience')}</h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {strengths.experience.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <Icon
                    name={item.kind === 'course' ? 'cap' : item.kind === 'volunteer' ? 'heart' : 'briefcase'}
                    className="mt-0.5 size-4 shrink-0 text-blue"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-night">{item.what}</span>
                    <span className="block text-xs font-light text-copy">
                      {[t(`strengths.kind_${item.kind}`), item.where, item.when].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                </li>
              ))}
              {finished.map((course) => (
                <li key={course.id} className="flex items-start gap-3">
                  <Icon name="award" className="mt-0.5 size-4 shrink-0 text-success" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-night">{course.title}</span>
                    <span className="block text-xs font-light text-copy">
                      {t('strengths.cvCertificate', { code: kursos[course.id]?.certificate ?? '' })}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </section>
  )
}

/** "Leva para o teu CV": the same proposals as the editor; a CV is made if there is none. */
function ToCv() {
  const { t } = useTranslation()
  const user = useUser()
  const document = activeCv(user)
  const cv = document?.cv ?? { ...EMPTY_CV, name: user.profile?.name ?? '' }
  const suggestions = useCvSuggestions(cv, document?.target)
  const [open, setOpen] = useState(false)
  const [applied, setApplied] = useState(false)

  if (suggestions.length === 0 && !applied) return null

  return (
    <section aria-labelledby="to-cv">
      <Card className="flex flex-wrap items-center gap-4 p-6">
        <div className="min-w-0 flex-1 basis-60">
          <h2 id="to-cv" className="text-lg font-extrabold text-night">
            {t('strengths.toCvTitle')}
          </h2>
          <p className="mt-1 text-sm font-light text-copy">
            {applied ? t('strengths.toCvDone') : t('cv.fillBody', { count: suggestions.length })}
          </p>
        </div>
        {applied ? (
          <Link
            to="/cv/editar"
            className="text-sm font-semibold text-blue underline-offset-4 hover:underline"
          >
            {t('strengths.openCv')}
          </Link>
        ) : (
          <Button variant="secondary" onClick={() => setOpen(true)}>
            <Icon name="document" className="size-4" />
            {t('strengths.toCvCta')}
          </Button>
        )}
      </Card>
      <CvFillDialog
        open={open}
        onClose={() => setOpen(false)}
        suggestions={suggestions}
        onApply={(chosen) => {
          if (!activeCv(getUser())) userActions.createCv()
          const current = activeCv(getUser())
          if (current) userActions.updateCv(applyCvSuggestions(current.cv, chosen))
          setApplied(true)
          setOpen(false)
        }}
      />
    </section>
  )
}
