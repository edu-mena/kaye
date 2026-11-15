import { useState, type SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { Dialog } from '../../components/ui/Dialog'
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { useCareers } from '../../data/queries'
import type { CareerSummary, Mentor } from '../../data/types'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { canRequest, requestChannels, requestHref, sessionKind, type RequestChannel } from './mentorRequest'
import { useMinor, useVisibleMentors } from './useVisibleMentors'

const PHOTOS = import.meta.glob<string>('../../assets/mentors/*.{webp,jpg,jpeg,png}', {
  eager: true,
  import: 'default',
})

export default function MentorsPage() {
  const { t } = useTranslation()
  const mentors = useVisibleMentors()
  const { data: careers = [] } = useCareers()
  const [params, setParam] = useUrlFilters()
  const [asking, setAsking] = useState<Mentor | null>(null)

  const careerOf = (slug: string) => careers.find((career) => career.slug === slug)
  const groupsOf = (mentor: Mentor) =>
    mentor.careers.map((slug) => careerOf(slug)?.group).filter((group) => group !== undefined)
  const mentorCareers = [...new Set(mentors.flatMap((mentor) => mentor.careers))]
    .map(careerOf)
    .filter((career): career is CareerSummary => career !== undefined)
  const groups = [...new Set(mentorCareers.map((career) => career.group))]

  const area = params.get('area')
  const careerSlug = params.get('carreira')
  const shown = mentors.filter(
    (mentor) =>
      (!area || groupsOf(mentor).includes(area as CareerSummary['group'])) &&
      (!careerSlug || mentor.careers.includes(careerSlug)),
  )
  const careerOptions = mentorCareers.filter((career) => !area || career.group === area)

  return (
    <>
      <PageHeader title={t('mentors.title')} subtitle={t('mentors.subtitle')} />
      <Rules />
      {mentors.length === 0 ? (
        <Card tone="gray" className="mt-6 flex items-start gap-3">
          <Icon name="clock" className="mt-0.5 size-5 shrink-0" />
          <p className="text-sm font-light text-copy">{t('mentors.empty')}</p>
        </Card>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <SelectField
              label={t('mentors.area')}
              placeholder={t('mentors.allAreas')}
              value={area ?? ''}
              options={groups.map((group) => ({ value: group, label: t(`groups.${group}`) }))}
              onChange={(event) => setParam('area', event.target.value || null, ['carreira'])}
            />
            <SelectField
              label={t('mentors.career')}
              placeholder={t('mentors.allCareers')}
              value={careerSlug ?? ''}
              options={careerOptions.map((career) => ({ value: career.slug, label: career.name }))}
              onChange={(event) => setParam('carreira', event.target.value || null)}
            />
          </div>
          {shown.length === 0 ? (
            <p className="mt-6 text-sm font-light text-muted">{t('mentors.noMatch')}</p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((mentor) => (
                <li key={mentor.id}>
                  <MentorCard
                    mentor={mentor}
                    careers={mentor.careers.map((slug) => careerOf(slug)?.name ?? slug)}
                    onAsk={() => setAsking(mentor)}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {asking && (
        <RequestDialog
          mentor={asking}
          careers={asking.careers.map((slug) => ({ value: slug, label: careerOf(slug)?.name ?? slug }))}
          initialCareer={careerSlug && asking.careers.includes(careerSlug) ? careerSlug : ''}
          onClose={() => setAsking(null)}
        />
      )}
    </>
  )
}

function Rules() {
  const { t } = useTranslation()
  const rules = ['mentors.ruleFree', 'mentors.ruleMoney', 'mentors.ruleMinors', 'mentors.ruleData'] as const
  return (
    <Card as="section" aria-labelledby="mentor-rules" tone="gray">
      <h2 id="mentor-rules" className="flex items-center gap-2 text-base font-semibold text-night">
        <Icon name="shield" className="size-5" />
        {t('mentors.rulesTitle')}
      </h2>
      <ul className="mt-3 space-y-2 text-sm font-light text-copy">
        {rules.map((rule) => (
          <li key={rule} className="flex items-start gap-2">
            <Icon name="check" className="mt-0.5 size-4 shrink-0 text-blue" />
            {t(rule)}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm font-light text-copy">
        {t('mentors.report')}{' '}
        <Link to="/suporte" className="font-normal text-night underline underline-offset-2">
          {t('mentors.reportLink')}
        </Link>
      </p>
    </Card>
  )
}

function MentorCard({ mentor, careers, onAsk }: { mentor: Mentor; careers: string[]; onAsk: () => void }) {
  const { t, i18n } = useTranslation()
  const photo = mentor.photo ? PHOTOS[`../../assets/mentors/${mentor.photo}`] : undefined
  const names = new Intl.DisplayNames([i18n.language], { type: 'language' })
  const languages = mentor.languages.map((code) => names.of(code) ?? code).join(', ')
  const initials = mentor.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')

  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-3">
        {photo ? (
          <img src={photo} alt="" decoding="async" className="size-14 shrink-0 rounded-full object-cover" />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-full bg-coal font-display text-lg font-bold text-gold"
          >
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-night">{mentor.name}</h3>
          <p className="text-sm font-light text-copy">
            {[mentor.role, mentor.company].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>
      <p className="text-sm leading-relaxed font-light text-copy">{mentor.bio}</p>
      <div className="flex flex-wrap gap-2">
        {careers.map((name) => (
          <Chip key={name}>{name}</Chip>
        ))}
      </div>
      <p className="text-xs font-light text-muted">
        <Icon name="globe" className="mr-1 inline size-3.5" />
        {languages} · {t(`mentors.availability_${mentor.availability}`)}
      </p>
      {canRequest && (
        <Button size="sm" className="mt-auto self-start" onClick={onAsk}>
          <Icon name="message" className="size-4" />
          {t('mentors.ask')}
        </Button>
      )}
    </Card>
  )
}

type RequestDialogProps = {
  mentor: Mentor
  careers: { value: string; label: string }[]
  initialCareer: string
  onClose: () => void
}

/** A short form that becomes a message to Kayé: nothing is kept, nothing is sent by the app. */
function RequestDialog({ mentor, careers, initialCareer, onClose }: RequestDialogProps) {
  const { t } = useTranslation()
  const minor = useMinor()
  const [goal, setGoal] = useState('')
  const [career, setCareer] = useState(
    initialCareer || (careers.length === 1 ? (careers[0]?.value ?? '') : ''),
  )
  const [when, setWhen] = useState('')
  const [tried, setTried] = useState(false)
  const kind = sessionKind(mentor, minor)
  const careerName = careers.find((option) => option.value === career)?.label ?? ''
  const valid = goal.trim().length > 0 && career !== '' && when.trim().length > 0

  const subject = t('mentors.messageSubject', { name: mentor.name })
  const body = t('mentors.messageBody', {
    name: mentor.name,
    kind: t(`mentors.session_${kind}`),
    career: careerName,
    goal: goal.trim(),
    when: when.trim(),
  })

  const send = (channel: RequestChannel) => (event: SyntheticEvent) => {
    setTried(true)
    if (!valid) {
      event.preventDefault()
      return
    }
    window.open(requestHref(channel, subject, body), '_blank', 'noopener,noreferrer')
    event.preventDefault()
    onClose()
  }

  return (
    <Dialog open onClose={onClose} title={t('mentors.askTitle', { name: mentor.name })}>
      <form noValidate onSubmit={send(requestChannels[0] ?? 'email')} className="space-y-4">
        <p className="text-sm font-light text-copy">
          {t('mentors.askIntro', { kind: t(`mentors.session_${kind}`) })}
        </p>
        <TextAreaField
          label={t('mentors.goal')}
          value={goal}
          maxLength={400}
          error={tried && !goal.trim() ? t('mentors.required') : null}
          onChange={(event) => setGoal(event.target.value)}
        />
        <SelectField
          label={t('mentors.career')}
          placeholder={t('mentors.pickCareer')}
          value={career}
          options={careers}
          error={tried && !career ? t('mentors.required') : null}
          onChange={(event) => setCareer(event.target.value)}
        />
        <TextField
          label={t('mentors.when')}
          hint={t('mentors.whenHint')}
          value={when}
          maxLength={120}
          error={tried && !when.trim() ? t('mentors.required') : null}
          onChange={(event) => setWhen(event.target.value)}
        />
        <p className="flex items-start gap-1.5 text-xs font-light text-muted">
          <Icon name="lock" className="mt-0.5 size-3.5 shrink-0" />
          {t('mentors.nothingKept')}
        </p>
        <div className="flex flex-wrap gap-2">
          {requestChannels.map((channel, index) => (
            <Button
              key={channel}
              type={index === 0 ? 'submit' : 'button'}
              variant={index === 0 ? 'primary' : 'secondary'}
              onClick={index === 0 ? undefined : send(channel)}
            >
              <Icon name={channel === 'whatsapp' ? 'phone' : 'mail'} className="size-4" />
              {t(`mentors.send_${channel}`)}
            </Button>
          ))}
        </div>
      </form>
    </Dialog>
  )
}
