import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { Icon, type IconName } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { CheckboxField, SelectField, TextField } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { AREA_QUESTIONS, type InterviewQuestion } from '../../data/demo/interviews'
import { useCareers } from '../../data/queries'
import { getCareer, sendInterview } from '../../data/source'
import { GROUP_AREAS, MARKET_AREAS, type MarketArea } from '../../data/types'
import { buildCareerInterview } from '../../domain/careerInterview'
import { isMinor } from '../../domain/education'
import {
  ANSWER_SECONDS,
  AREA_COUNT,
  buildInterview,
  GENERAL_COUNT,
  type InterviewAnswer,
  INTERVIEWS_PER_DAY,
  sentToday,
  THINK_SECONDS,
} from '../../domain/interviews'
import { ApiError } from '../../lib/api'
import { useFocus } from '../../lib/focusMode'
import { userActions, useUser } from '../../state/userStore'
import { AREA_ICONS } from '../../components/areaIcons'
import { InterviewRunner } from './InterviewRunner'
import { useShowsSalaries } from '../../state/useShowsSalaries'

type Session = {
  area: MarketArea
  /** Set when the interview was built from a profession's page. */
  career?: { slug: string; name: string }
  questions: InterviewQuestion[]
  startedAt: string
}
type Stage =
  | { name: 'setup' }
  | { name: 'running'; session: Session }
  | { name: 'send'; session: Session; answers: InterviewAnswer[] }
  | { name: 'sent'; session: Session }

const isArea = (value: string | null): value is MarketArea => MARKET_AREAS.includes(value as MarketArea)

/**
 * Simulador de entrevistas (/entrevistas): no AI. The person answers by writing or dictating, and
 * the answers go to the Kayé team, who review them and get in touch. Two interviews a day.
 */
export default function InterviewsPage() {
  const { t } = useTranslation()
  const [stage, setStage] = useState<Stage>({ name: 'setup' })
  const { skills } = useUser()
  const showsSalaries = useShowsSalaries()
  useFocus(stage.name === 'running' || stage.name === 'send')

  const startCareer = async (slug: string) => {
    const career = await getCareer(slug)
    if (!career) return
    setStage({
      name: 'running',
      session: {
        area: GROUP_AREAS[career.group],
        career: { slug: career.slug, name: career.name },
        // A minor practises without the salary question: it quotes the career's real salaries.
        questions: buildCareerInterview(career, skills, Date.now()).filter(
          (question) => showsSalaries || question.kind !== 'salary',
        ),
        startedAt: new Date().toISOString(),
      },
    })
  }

  const start = (area: MarketArea) =>
    setStage({
      name: 'running',
      session: { area, questions: buildInterview(area, Date.now()), startedAt: new Date().toISOString() },
    })

  return (
    <>
      {stage.name === 'setup' && (
        <PageHeader
          compact
          tour="interviews"
          title={t('interviews.title')}
          subtitle={t('interviews.subtitle')}
        />
      )}
      {stage.name === 'running' ? (
        <InterviewRunner
          questions={stage.session.questions}
          onFinish={(answers) => setStage({ name: 'send', session: stage.session, answers })}
          onQuit={() => setStage({ name: 'setup' })}
        />
      ) : stage.name === 'send' ? (
        <Send
          session={stage.session}
          answers={stage.answers}
          onSent={() => setStage({ name: 'sent', session: stage.session })}
          onQuit={() => setStage({ name: 'setup' })}
        />
      ) : stage.name === 'sent' ? (
        <Sent session={stage.session} onBack={() => setStage({ name: 'setup' })} />
      ) : (
        <Setup onStart={start} onStartCareer={(slug) => void startCareer(slug)} />
      )}
    </>
  )
}

type StartCardProps = {
  icon: IconName
  title: string
  detail: string
  chip?: string | null
  disabled: boolean
  onClick: () => void
}

/** One way to start an interview: a profession or an area. */
function StartCard({ icon, title, detail, chip, disabled, onClick }: StartCardProps) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group flex h-full w-full flex-col gap-3 rounded-card bg-surface p-4 text-left shadow-card transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="grid size-10 place-items-center rounded-full bg-blue text-white">
          <Icon name={icon} className="size-5" />
        </span>
        {chip && <Chip tone="gold">{chip}</Chip>}
      </span>
      <span className="text-base font-semibold text-night">{title}</span>
      <span className="text-xs font-light text-muted">{detail}</span>
      <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-blue">
        {t('interviews.start')}
        <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  )
}

type CardGridProps = { id: string; title: string; intro: string; children: ReactNode }

function CardGrid({ id, title, intro, children }: CardGridProps) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-base font-semibold text-night">
        {title}
      </h2>
      <p className="mt-1 text-sm font-light text-copy">{intro}</p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
    </section>
  )
}

const MAX_CAREER_CARDS = 6

/** "Por profissão": the linked career, the destination and the saved ones, then any other from a list. */
function CareerInterviews({ disabled, onStart }: { disabled: boolean; onStart: (slug: string) => void }) {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const { targetCareer, savedCareers } = useUser()
  const { data: careers = [] } = useCareers()
  const [picked, setPicked] = useState('')
  const detailed = careers
    .filter((career) => career.detailed)
    .toSorted((a, b) => a.name.localeCompare(b.name))
  const bySlug = new Map(detailed.map((career) => [career.slug, career]))
  const linked = params.get('carreira')
  const slugs = [...new Set([linked, targetCareer, ...savedCareers])].filter((slug): slug is string =>
    Boolean(slug && bySlug.has(slug)),
  )
  const chipOf = (slug: string) =>
    slug === linked ? t('interviews.fromPage') : slug === targetCareer ? t('interviews.target') : null

  return (
    <CardGrid
      id="interview-careers"
      title={t('interviews.careersTitle')}
      intro={t('interviews.careersIntro')}
    >
      {slugs.slice(0, MAX_CAREER_CARDS).flatMap((slug) => {
        const career = bySlug.get(slug)
        return career
          ? [
              <li key={slug}>
                <StartCard
                  icon={AREA_ICONS[GROUP_AREAS[career.group]]}
                  title={career.name}
                  detail={t('interviews.careerDetail')}
                  chip={chipOf(slug)}
                  disabled={disabled}
                  onClick={() => onStart(slug)}
                />
              </li>,
            ]
          : []
      })}
      <li className="flex flex-col gap-3 rounded-card bg-ash-100 p-4">
        <SelectField
          label={t('interviews.otherCareer')}
          placeholder={t('interviews.pickCareer')}
          options={detailed.map((career) => ({ value: career.slug, label: career.name }))}
          value={picked}
          onChange={(event) => setPicked(event.target.value)}
        />
        <Button className="mt-auto self-start" disabled={disabled || !picked} onClick={() => onStart(picked)}>
          {t('interviews.start')}
        </Button>
      </li>
    </CardGrid>
  )
}

type SetupProps = { onStart: (area: MarketArea) => void; onStartCareer: (slug: string) => void }

function Setup({ onStart, onStartCareer }: SetupProps) {
  const { t, i18n } = useTranslation()
  const [params] = useSearchParams()
  const { discovery, interviews: history } = useUser()
  const linked = params.get('area')
  const mine = new Set<MarketArea>([...(isArea(linked) ? [linked] : []), ...(discovery?.areas ?? [])])
  const areas = MARKET_AREAS.toSorted((a, b) => Number(mine.has(b)) - Number(mine.has(a)))
  const done = sentToday(history)
  const left = Math.max(0, INTERVIEWS_PER_DAY - done)

  return (
    <div className="space-y-4">
      <Panel id="interview-how" icon="info" title={t('interviews.howTitle')}>
        <p className="text-sm font-light text-copy">
          {t('interviews.info', {
            general: GENERAL_COUNT,
            area: AREA_COUNT,
            think: THINK_SECONDS,
            answer: ANSWER_SECONDS / 60,
          })}
        </p>
        <p className="mt-2 text-sm font-light text-copy">{t('interviews.infoCareer')}</p>
        <p className={`mt-3 text-sm ${left === 0 ? 'font-normal text-coral' : 'font-light text-muted'}`}>
          {left === 0 ? t('interviews.limitReached') : t('interviews.limitLeft', { count: left })}
        </p>
      </Panel>

      <CareerInterviews disabled={left === 0} onStart={onStartCareer} />

      <CardGrid id="interview-areas" title={t('interviews.areasTitle')} intro={t('interviews.areasIntro')}>
        {areas.map((area) => (
          <li key={area}>
            <StartCard
              icon={AREA_ICONS[area]}
              title={t(`market.area_${area}`)}
              detail={t('interviews.areaQuestions', { count: AREA_QUESTIONS[area].length })}
              chip={mine.has(area) ? t('interviews.forYou') : null}
              disabled={left === 0}
              onClick={() => onStart(area)}
            />
          </li>
        ))}
      </CardGrid>

      {history.length > 0 && (
        <Panel id="interview-history" icon="clock" title={t('interviews.historyTitle')}>
          <ul className="divide-y divide-line text-sm font-light text-copy">
            {history.slice(0, 8).map((entry) => (
              <li key={entry.at} className="flex items-center justify-between gap-3 py-2">
                <span>
                  {new Date(entry.at).toLocaleDateString(i18n.language)} ·{' '}
                  {entry.career ?? t(`market.area_${entry.area}`)}
                </span>
                <Chip>{t('interviews.pending')}</Chip>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel
        id="interview-expert"
        icon="users"
        title={t('interviews.expertTitle')}
        tone="muted"
        action={<Chip>{t('interviews.soon')}</Chip>}
      >
        <p className="text-sm font-light text-copy">{t('interviews.expertBody')}</p>
      </Panel>
    </div>
  )
}

type SendProps = { session: Session; answers: InterviewAnswer[]; onSent: () => void; onQuit: () => void }

/** The last step: who to contact, consent, and the answers go to the Kayé team. */
function Send({ session, answers, onSent, onQuit }: SendProps) {
  const { t, i18n } = useTranslation()
  const { profile, publicPage } = useUser()
  const [contact, setContact] = useState(publicPage?.card.email ?? publicPage?.card.whatsapp ?? '')
  const [consent, setConsent] = useState(false)
  const [guardian, setGuardian] = useState(profile?.guardianInformed ?? false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<'interviews.tooMany' | 'interviews.sendFailed' | null>(null)
  const minor = profile ? isMinor(profile.birthYear) : false
  const answered = answers.filter((answer) => answer.answer !== '').length
  const validContact =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim()) || /^\+?\d{7,16}$/.test(contact.replace(/[\s-]/g, ''))
  const ready = Boolean(profile) && validContact && consent && (!minor || guardian) && answered > 0

  const send = async () => {
    if (!profile || !ready) return
    setSending(true)
    setError(null)
    try {
      await sendInterview({
        area: session.area,
        ...(session.career ? { career: session.career } : {}),
        locale: i18n.language.slice(0, 2),
        startedAt: session.startedAt,
        candidate: {
          name: profile.name,
          birthYear: profile.birthYear,
          province: profile.province,
          education: profile.education,
          contact: contact.trim(),
          guardianInformed: guardian,
        },
        answers,
      })
      userActions.addInterview({
        at: new Date().toISOString(),
        area: session.area,
        questions: answers.length,
        ...(session.career ? { career: session.career.name } : {}),
      })
      onSent()
    } catch (failure) {
      setError(
        failure instanceof ApiError && failure.status === 429
          ? 'interviews.tooMany'
          : 'interviews.sendFailed',
      )
      setSending(false)
    }
  }

  return (
    <Panel id="interview-send" icon="message" title={t('interviews.sendTitle')}>
      <div className="space-y-4">
        <p className="text-sm font-light text-copy">
          {t('interviews.sendBody', {
            answered,
            total: answers.length,
            area: session.career?.name ?? t(`market.area_${session.area}`),
          })}
        </p>
        {answered === 0 && (
          <p className="text-sm font-normal text-coral">{t('interviews.nothingAnswered')}</p>
        )}
        <TextField
          label={t('interviews.contactLabel')}
          hint={t('interviews.contactHint')}
          value={contact}
          autoComplete="email"
          onChange={(event) => setContact(event.target.value)}
          error={contact.trim() && !validContact ? t('interviews.contactInvalid') : null}
        />
        <CheckboxField
          label={t('interviews.consent')}
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        {minor && (
          <CheckboxField
            label={t('interviews.guardian')}
            checked={guardian}
            onChange={(event) => setGuardian(event.target.checked)}
          />
        )}
        {error && <p className="text-sm font-normal text-coral">{t(error)}</p>}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void send()} disabled={!ready || sending}>
            {t(sending ? 'interviews.sending' : 'interviews.send')}
          </Button>
          <Button variant="ghost" onClick={onQuit} disabled={sending}>
            {t('interviews.discard')}
          </Button>
        </div>
        <p className="text-xs font-light text-muted">{t('interviews.privacy')}</p>
      </div>
    </Panel>
  )
}

/** Sent: the team will get in touch; meanwhile, how each question is usually answered. */
function Sent({ session, onBack }: { session: Session; onBack: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <Panel id="interview-sent" icon="check" title={t('interviews.sentTitle')}>
        <p className="text-sm font-light text-copy">{t('interviews.sentBody')}</p>
      </Panel>
      <Panel id="interview-models" icon="book" title={t('interviews.modelsTitle')}>
        <p className="mb-3 text-sm font-light text-copy">{t('interviews.modelsBody')}</p>
        <ul className="space-y-2">
          {session.questions.map((question) => (
            <li key={question.id}>
              <details className="group rounded-2xl bg-ash-100 p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-night">
                  {question.text}
                  <Icon
                    name="chevronRight"
                    className="size-4 shrink-0 transition-transform group-open:rotate-90"
                  />
                </summary>
                <div className="mt-3 space-y-3 text-sm font-light text-copy">
                  <p>
                    <span className="font-normal text-night">{t('interviews.goal')}</span> {question.goal}
                  </p>
                  <p className="border-l-2 border-blue pl-3">{question.model}</p>
                  <div>
                    <p className="font-normal text-night">{t('interviews.mistakes')}</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      {question.mistakes.map((mistake) => (
                        <li key={mistake}>{mistake}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      </Panel>
      <Button onClick={onBack}>{t('interviews.back')}</Button>
    </div>
  )
}
