import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { BarList } from '../../components/ui/BarList'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { SelectField } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { EXAM_SUBJECTS, type ExamSubject, type ExamTopic } from '../../data/demo/accessExams'
import { useAdmissions, useCourses } from '../../data/queries'
import type { Admission, CatalogCourse } from '../../data/types'
import {
  addScores,
  bankOf,
  buildExamSession,
  type ExamItem,
  type ExamMode,
  examOverall,
  PRACTICE_SIZE,
  rankedTopics,
  scoreByTopic,
  SIMULATION_SECONDS,
  SIMULATION_SIZE,
  subjectOf,
  type TopicScore,
  type TopicScores,
  topicShare,
  topicsOf,
  topicsToReview,
} from '../../domain/accessExams'
import { admissionsFor } from '../../domain/admissions'
import { useFocus } from '../../lib/focusMode'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { userActions, useUser } from '../../state/userStore'
import { AdmissionBlock } from '../training/AdmissionBlock'

type Session = {
  subject: ExamSubject
  mode: ExamMode
  topic?: ExamTopic
  items: ExamItem[]
  startedAt: number
}
type Finished = Session & { picks: (number | null)[]; topics: TopicScores; timedOut: boolean }
type Start = (subject: ExamSubject, mode: ExamMode, topic?: ExamTopic) => void

const LETTERS = ['A', 'B', 'C', 'D'] as const
const OPTION =
  'flex gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-normal text-night transition-colors disabled:cursor-default'
const asPercent = (value: number) => Math.round(value * 100)
const clock = (seconds: number) => {
  const whole = Math.max(0, Math.ceil(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

/** The institutions' own records for a course (the national calendar has no subjects). */
const institutionRecords = (admissions: Admission[], course: CatalogCourse) =>
  admissionsFor(admissions, { course }).filter((admission) => admission.academyId !== null)

/** The course and institution in the address (?curso=&instituicao=), with their records and exam subjects. */
function useChosenExam() {
  const [params, setParam] = useUrlFilters()
  const { data: courses = [] } = useCourses()
  const { data: admissions = [] } = useAdmissions()
  const options = useMemo(
    () =>
      courses
        .filter((course) => institutionRecords(admissions, course).length > 0)
        .toSorted((a, b) => a.name.localeCompare(b.name)),
    [courses, admissions],
  )
  const course = options.find((option) => option.id === params.get('curso')) ?? null
  const records = course ? institutionRecords(admissions, course) : []
  const names = new Map(course?.offers.map(({ academy }) => [academy.id, academy.name]))
  const academies = [...new Set(records.map((record) => record.academyId ?? ''))].map((id) => ({
    id,
    name: names.get(id) ?? id,
  }))
  const academy =
    academies.find((option) => option.id === params.get('instituicao')) ??
    (academies.length === 1 ? academies[0] : null)
  const chosen = academy ? records.filter((record) => record.academyId === academy.id) : []
  const subjects = new Set(
    chosen.flatMap((record) => record.subjects.map(subjectOf)).filter((subject) => subject !== null),
  )
  return {
    options,
    course,
    academies,
    academy,
    chosen,
    subjects,
    setCourse: (id: string) => setParam('curso', id || null, ['instituicao']),
    setAcademy: (id: string) => setParam('instituicao', id || null),
  }
}

/**
 * Exames de acesso (/exames-de-acesso): what the exam of a course and institution asks for, then practice by
 * subject with original questions: "Treino" corrected at each answer, "Simulação" against the clock.
 */
export default function AccessExamsPage() {
  const { t } = useTranslation()
  const [session, setSession] = useState<Session | null>(null)
  const [finished, setFinished] = useState<Finished | null>(null)
  const exam = useChosenExam()
  useFocus(session !== null)

  const start: Start = (subject, mode, topic) => {
    setFinished(null)
    setSession({
      subject,
      mode,
      topic,
      items: buildExamSession(subject, mode, Date.now(), topic),
      startedAt: Date.now(),
    })
    window.scrollTo({ top: 0 })
  }

  const finish = (picks: (number | null)[], timedOut: boolean) => {
    if (!session) return
    const topics = scoreByTopic(
      session.items.map((item, index) => ({ topic: item.topic, correct: picks[index] === item.answer })),
    )
    // Only the grades per topic are kept, never the answers.
    userActions.addAccessExam({
      at: new Date().toISOString(),
      subject: session.subject,
      mode: session.mode,
      topics,
    })
    setFinished({ ...session, picks, topics, timedOut })
    setSession(null)
    window.scrollTo({ top: 0 })
  }

  if (session) return <Runner session={session} onFinish={finish} onQuit={() => setSession(null)} />

  return (
    <>
      <PageHeader
        compact
        tour="admissions"
        title={t('accessExams.title')}
        subtitle={t('accessExams.subtitle')}
      />
      {finished ? (
        <Result finished={finished} onStart={start} onBack={() => setFinished(null)} />
      ) : (
        <div className="space-y-6">
          <YourExam exam={exam} onStart={start} />
          <Subjects inExam={exam.subjects} onStart={start} />
        </div>
      )}
    </>
  )
}

// ---------- (a) O teu exame ----------

function YourExam({ exam, onStart }: { exam: ReturnType<typeof useChosenExam>; onStart: Start }) {
  const { t } = useTranslation()
  const { course, academy } = exam
  const path = `/exames-de-acesso?curso=${course?.id ?? ''}&instituicao=${academy?.id ?? ''}`
  return (
    <Panel id="access-exam-choose" icon="target" title={t('accessExams.yourExam')}>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label={t('accessExams.course')}
          placeholder={t('accessExams.coursePlaceholder')}
          options={exam.options.map((option) => ({ value: option.id, label: option.name }))}
          value={course?.id ?? ''}
          onChange={(event) => exam.setCourse(event.target.value)}
        />
        <SelectField
          label={t('accessExams.institution')}
          placeholder={t('accessExams.institutionPlaceholder')}
          options={exam.academies.map((option) => ({ value: option.id, label: option.name }))}
          value={academy?.id ?? ''}
          disabled={!course}
          onChange={(event) => exam.setAcademy(event.target.value)}
        />
      </div>
      {exam.chosen.length === 0 ? (
        <p className="mt-4 text-sm font-light text-copy">{t('accessExams.pickCourse')}</p>
      ) : (
        <div className="mt-5 grid gap-4">
          {exam.chosen.map((record) => (
            <div key={record.id} className="space-y-3">
              <AdmissionBlock admission={record} title={academy?.name ?? ''} path={path} />
              <SubjectButtons subjects={record.subjects} onStart={onStart} />
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}

/** One button per exam subject that has questions; the others as a label. */
function SubjectButtons({ subjects, onStart }: { subjects: string[]; onStart: Start }) {
  const { t } = useTranslation()
  if (subjects.length === 0)
    return <p className="text-sm font-light text-copy">{t('accessExams.noSubjects')}</p>
  return (
    <ul className="flex flex-wrap gap-2">
      {subjects.map((name) => {
        const subject = subjectOf(name)
        const ready = subject !== null && bankOf(subject).length > 0
        return (
          <li key={name}>
            {ready ? (
              <Button size="sm" onClick={() => onStart(subject, 'practice')}>
                <Icon name="pencil" className="size-4" />
                {t('accessExams.train', { subject: name })}
              </Button>
            ) : (
              <Chip>{subject ? t('accessExams.soonSubject', { subject: name }) : name}</Chip>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// ---------- (b) As disciplinas ----------

function Subjects({ inExam, onStart }: { inExam: Set<ExamSubject>; onStart: Start }) {
  const { t } = useTranslation()
  const ordered = EXAM_SUBJECTS.toSorted(
    (a, b) =>
      Number(bankOf(b).length > 0) - Number(bankOf(a).length > 0) ||
      Number(inExam.has(b)) - Number(inExam.has(a)),
  )
  return (
    <section aria-labelledby="access-exam-subjects">
      <h2 id="access-exam-subjects" className="text-lg font-extrabold text-night">
        {t('accessExams.subjectsTitle')}
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light text-copy">
        <strong className="font-semibold text-night">{t('accessExams.practice')}:</strong>{' '}
        {t('accessExams.practiceInfo', { count: PRACTICE_SIZE })}{' '}
        <strong className="font-semibold text-night">{t('accessExams.simulation')}:</strong>{' '}
        {t('accessExams.simulationInfo', { count: SIMULATION_SIZE, minutes: SIMULATION_SECONDS / 60 })}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((subject) => (
          <SubjectCard key={subject} subject={subject} inExam={inExam.has(subject)} onStart={onStart} />
        ))}
      </div>
      <p className="mt-4 text-xs font-light text-muted">{t('accessExams.note')}</p>
    </section>
  )
}

function SubjectCard({
  subject,
  inExam,
  onStart,
}: {
  subject: ExamSubject
  inExam: boolean
  onStart: Start
}) {
  const { t } = useTranslation()
  const { accessExams } = useUser()
  const count = bankOf(subject).length
  const name = t(`accessExams.subject_${subject}`)
  const sessions = accessExams.filter((entry) => entry.subject === subject)
  const total = addScores(sessions.map((entry) => entry.topics))
  const weakest = rankedTopics(total)[0]

  if (count === 0)
    return (
      <Card as="article" tone="gray" aria-label={name}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-night">{name}</h3>
          <Chip>{t('accessExams.soon')}</Chip>
          {inExam && <Chip tone="gold">{t('accessExams.inYourExam')}</Chip>}
        </div>
        <p className="mt-2 text-sm font-light text-copy">{t('accessExams.soonBody')}</p>
      </Card>
    )

  return (
    <Card as="article" aria-label={name} className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-night">{name}</h3>
        {inExam && <Chip tone="gold">{t('accessExams.inYourExam')}</Chip>}
      </div>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        <li>
          <Chip>{t('accessExams.questions', { count })}</Chip>
        </li>
        <li>
          <Chip>{t('accessExams.topics', { count: topicsOf(subject).length })}</Chip>
        </li>
      </ul>
      <div className="mt-4 text-sm text-night">
        {sessions.length === 0 ? (
          <p className="font-light text-copy">{t('accessExams.notYet')}</p>
        ) : (
          <>
            <ProgressBar
              value={examOverall(total)}
              label={t('accessExams.progress', {
                value: asPercent(examOverall(total)),
                count: sessions.length,
              })}
            />
            <p className="mt-1.5 text-xs font-light">
              {t('accessExams.progress', { value: asPercent(examOverall(total)), count: sessions.length })}
            </p>
            {weakest && topicShare(total[weakest] as TopicScore) < 1 && (
              <p className="mt-1 text-xs font-semibold">
                {t('accessExams.weakest', { topic: t(`accessExams.topic_${weakest}`) })}
              </p>
            )}
          </>
        )}
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Button size="sm" onClick={() => onStart(subject, 'practice')}>
          {t('accessExams.practice')}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onStart(subject, 'simulation')}>
          <Icon name="clock" className="size-4" />
          {t('accessExams.simulation')}
        </Button>
      </div>
    </Card>
  )
}

// ---------- (c) Treino e simulação ----------

type RunnerProps = {
  session: Session
  onFinish: (picks: (number | null)[], timedOut: boolean) => void
  onQuit: () => void
}

function Runner({ session, onFinish, onQuit }: RunnerProps) {
  const { t } = useTranslation()
  const [picks, setPicks] = useState<(number | null)[]>([])
  /** Practice only: the option chosen for the question on screen, while its correction shows. */
  const [chosen, setChosen] = useState<number | null>(null)
  const [now, setNow] = useState(session.startedAt)
  const { items, mode, subject } = session
  const item = items[picks.length]
  const timed = mode === 'simulation'
  const leftAt = (at: number) => SIMULATION_SECONDS - (at - session.startedAt) / 1000

  // Each tick checks the time, so running out of time is handled where time passes.
  const onTick = useEffectEvent((at: number) => {
    // Out of time: what was not answered counts as wrong.
    if (leftAt(at) <= 0) onFinish([...picks, ...Array<null>(items.length - picks.length).fill(null)], true)
  })

  useEffect(() => {
    if (!timed) return
    const timer = window.setInterval(() => {
      const at = Date.now()
      setNow(at)
      onTick(at)
    }, 500)
    return () => window.clearInterval(timer)
  }, [timed])

  if (!item) return null

  const advance = (pick: number) => {
    const next = [...picks, pick]
    if (next.length === items.length) return onFinish(next, false)
    setPicks(next)
    setChosen(null)
  }
  const choose = (index: number) => (timed ? advance(index) : setChosen(index))
  const progress = t('accessExams.progressLabel', { current: picks.length + 1, total: items.length })
  const tone = (index: number) => {
    if (chosen === null) return 'border-line bg-surface hover:border-night hover:bg-ash-100'
    if (index === item.answer) return 'border-success bg-surface'
    return index === chosen ? 'border-coral bg-surface' : 'border-line bg-surface opacity-60'
  }

  return (
    <Panel
      id="access-exam-question"
      icon="pencil"
      title={`${t(`accessExams.subject_${subject}`)} · ${t(`accessExams.topic_${item.topic}`)}`}
      action={
        timed && (
          <span className="text-right text-xs font-light text-muted">
            {t('accessExams.timeLeft')}{' '}
            <span className="text-base font-semibold text-night tabular-nums" role="timer">
              {clock(leftAt(now))}
            </span>
          </span>
        )
      }
    >
      <ProgressBar value={picks.length / items.length} label={progress} className="mb-2" />
      <p className="mb-5 text-xs font-light text-muted">{progress}</p>
      {/* The questions are in Portuguese, whatever the language of the app. */}
      <div lang="pt" key={item.id}>
        {item.passage && (
          <blockquote className="mb-4 rounded-2xl bg-ash-100 p-4 text-sm leading-relaxed font-normal whitespace-pre-line text-night">
            {item.passage}
          </blockquote>
        )}
        <p className="text-lg font-normal text-night">{item.text}</p>
        <div className="mt-5 grid gap-3">
          {item.options.map((option, index) => (
            <button
              key={option}
              type="button"
              disabled={chosen !== null}
              className={`${OPTION} ${tone(index)}`}
              onClick={() => choose(index)}
            >
              <span className="font-semibold text-muted">{LETTERS[index]}</span>
              <span>{option}</span>
            </button>
          ))}
        </div>
        {chosen !== null && (
          <output className="mt-5 block rounded-2xl border border-line p-4">
            <p
              className={`flex items-center gap-2 text-sm font-semibold ${chosen === item.answer ? 'text-success' : 'text-coral'}`}
            >
              <Icon name={chosen === item.answer ? 'check' : 'close'} className="size-4 shrink-0" />
              {chosen === item.answer
                ? t('accessExams.right')
                : t('accessExams.wrong', { answer: item.options[item.answer] })}
            </p>
            <p className="mt-2 text-sm font-light text-copy">{item.explanation}</p>
          </output>
        )}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {chosen !== null && (
          <Button onClick={() => advance(chosen)}>
            {picks.length + 1 === items.length ? t('accessExams.finish') : t('accessExams.next')}
            <Icon name="arrowRight" className="size-4" />
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onQuit}>
          {t('accessExams.quit')}
        </Button>
      </div>
    </Panel>
  )
}

// ---------- (d) O resultado ----------

type ResultProps = { finished: Finished; onStart: Start; onBack: () => void }

function Result({ finished, onStart, onBack }: ResultProps) {
  const { t } = useTranslation()
  const { topics, items, picks, subject } = finished
  const review = topicsToReview(topics)
  const correct = items.filter((item, index) => picks[index] === item.answer).length
  const mistakes = items.flatMap((item, index) =>
    picks[index] === item.answer ? [] : [{ item, pick: picks[index] ?? null }],
  )
  const topicName = (topic: ExamTopic) => t(`accessExams.topic_${topic}`)

  return (
    <div className="space-y-4">
      <Panel
        id="access-exam-result"
        icon="chart"
        title={`${t('accessExams.resultTitle')} · ${t(`accessExams.subject_${subject}`)}`}
      >
        <p className="mb-4 text-base font-normal text-night">
          {t('accessExams.resultSummary', {
            correct,
            total: items.length,
            value: asPercent(examOverall(topics)),
          })}{' '}
          {finished.timedOut && t('accessExams.timeUp')}
        </p>
        <BarList
          label={t('accessExams.byTopic')}
          items={rankedTopics(topics).map((topic) => {
            const entry = topics[topic] as TopicScore
            return {
              label: topicName(topic),
              value: topicShare(entry),
              valueLabel: `${entry.correct}/${entry.total}`,
              emphasized: review.includes(topic),
            }
          })}
        />
      </Panel>
      <Panel id="access-exam-review" icon="target" title={t('accessExams.reviewTitle')}>
        {review.length === 0 ? (
          <p className="text-sm font-light text-copy">{t('accessExams.noReview')}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {review.map((topic) => (
              <li key={topic}>
                <Button size="sm" variant="secondary" onClick={() => onStart(subject, 'practice', topic)}>
                  {t('accessExams.reviewTopic', { topic: topicName(topic) })}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel id="access-exam-mistakes" icon="info" title={t('accessExams.mistakesTitle')}>
        {mistakes.length === 0 ? (
          <p className="text-sm font-light text-copy">{t('accessExams.noMistakes')}</p>
        ) : (
          <ol className="space-y-5">
            {mistakes.map(({ item, pick }) => (
              <li key={item.id} lang="pt" className="border-b border-line pb-5 last:border-0 last:pb-0">
                <p className="text-xs font-semibold text-muted">{topicName(item.topic)}</p>
                {item.passage && (
                  <details className="mt-1 text-sm">
                    <summary className="cursor-pointer font-semibold text-night">
                      {t('accessExams.showPassage')}
                    </summary>
                    <p className="mt-2 rounded-2xl bg-ash-100 p-3 font-light whitespace-pre-line text-night">
                      {item.passage}
                    </p>
                  </details>
                )}
                <p className="mt-1 text-sm font-normal text-night">{item.text}</p>
                <p className="mt-2 text-sm font-light text-coral">
                  {pick === null
                    ? t('accessExams.noAnswer')
                    : t('accessExams.yourAnswer', { answer: item.options[pick] })}
                </p>
                <p className="text-sm font-semibold text-success">
                  {t('accessExams.rightAnswer', { answer: item.options[item.answer] })}
                </p>
                <p className="mt-1 text-sm font-light text-copy">{item.explanation}</p>
              </li>
            ))}
          </ol>
        )}
      </Panel>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => onStart(subject, finished.mode, finished.topic)}>
          {t('accessExams.again')}
        </Button>
        <Button variant="secondary" onClick={onBack}>
          {t('accessExams.back')}
        </Button>
      </div>
    </div>
  )
}
