import { useEffect, useEffectEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { BarList } from '../../components/ui/BarList'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Segmented } from '../../components/ui/Segmented'
import {
  ATTENTION_SECONDS,
  averageSeconds,
  buildSession,
  FULL_QUESTIONS,
  FULL_SECONDS,
  LEVELS,
  overall,
  PRACTICE_QUESTIONS,
  type Answer,
  type Level,
  type Mode,
  type Question,
  type Scores,
  score,
  share,
  SKILLS,
  type Skill,
  weakSkills,
} from '../../domain/psychotech'
import { useFocus } from '../../lib/focusMode'
import { shareFile } from '../../lib/shareFile'
import { usePlus } from '../../lib/plan'
import { userActions, useUser } from '../../state/userStore'
import { PlusGate } from '../plus/PlusGate'
import { QuestionView } from './QuestionView'
import { storyImage } from './storyImage'

type Session = { mode: Mode; level: Level; questions: Question[]; startedAt: number }
type Finished = { mode: Mode; level: Level; scores: Scores; timedOut: boolean }

const TIPS = [1, 2, 3] as const
const clock = (seconds: number) => {
  const whole = Math.max(0, Math.ceil(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

/**
 * Treino psicotécnico (/treino): the kinds of questions of public competitions and scholarships,
 * generated from a seed. Practice only: never an IQ test, never an IQ number.
 */
export default function PsychotechPage() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('full')
  const [level, setLevel] = useState<Level>('medium')
  const [session, setSession] = useState<Session | null>(null)
  const [finished, setFinished] = useState<Finished | null>(null)
  useFocus(session !== null)

  const plus = usePlus()

  const start = (nextMode: Mode = mode) => {
    setMode(nextMode)
    setFinished(null)
    // "Treinar outra vez" on the result skips the setup screen, where the gate is: it must not skip the gate.
    if (plus.blocked('training')) return
    setSession({
      mode: nextMode,
      level,
      questions: buildSession(nextMode, level, Date.now()),
      startedAt: Date.now(),
    })
  }

  const finish = (answers: Answer[], timedOut: boolean) => {
    if (!session) return
    const scores = score(answers)
    userActions.addPsychotech({
      at: new Date().toISOString(),
      mode: session.mode,
      level: session.level,
      scores,
    })
    plus.spendTrial('training')
    setFinished({ mode: session.mode, level: session.level, scores, timedOut })
    setSession(null)
  }

  return (
    <>
      {!session && (
        <PageHeader
          compact
          tour="psychotech"
          title={t('psychotech.title')}
          subtitle={t('psychotech.subtitle')}
        />
      )}
      {session ? (
        <Runner session={session} onFinish={finish} onQuit={() => setSession(null)} />
      ) : finished ? (
        <Result finished={finished} onAgain={() => setFinished(null)} onTrain={start} />
      ) : (
        <PlusGate feature="training">
          <Setup mode={mode} level={level} onMode={setMode} onLevel={setLevel} onStart={() => start()} />
        </PlusGate>
      )}
    </>
  )
}

type SetupProps = {
  mode: Mode
  level: Level
  onMode: (mode: Mode) => void
  onLevel: (level: Level) => void
  onStart: () => void
}

function Setup({ mode, level, onMode, onLevel, onStart }: SetupProps) {
  const { t, i18n } = useTranslation()
  const { psychotech: history } = useUser()
  const modeLabel = (value: Mode) =>
    t(value === 'full' ? 'psychotech.mode_full' : `psychotech.skill_${value}`)

  return (
    <div className="space-y-4">
      <Panel id="psychotech-setup" icon="brain" title={t('psychotech.setupTitle')}>
        <div className="space-y-4">
          <Segmented
            label={t('psychotech.modeLabel')}
            options={(['full', ...SKILLS] as Mode[]).map((value) => ({ value, label: modeLabel(value) }))}
            value={mode}
            onChange={(value) => value && onMode(value)}
          />
          <Segmented
            label={t('psychotech.levelLabel')}
            options={LEVELS.map((value) => ({ value, label: t(`psychotech.level_${value}`) }))}
            value={level}
            onChange={(value) => value && onLevel(value)}
          />
          <p className="text-sm font-light text-copy">
            {mode === 'full'
              ? t('psychotech.fullInfo', { count: FULL_QUESTIONS, minutes: FULL_SECONDS / 60 })
              : t('psychotech.practiceInfo', { count: PRACTICE_QUESTIONS })}{' '}
            {mode !== 'full' && t(`psychotech.skillBody_${mode}`)}{' '}
            {(mode === 'full' || mode === 'attention') &&
              t('psychotech.attentionInfo', { seconds: ATTENTION_SECONDS[level] })}
          </p>
          <Button onClick={onStart}>{t('psychotech.start')}</Button>
          <p className="text-xs font-light text-muted">{t('psychotech.note')}</p>
        </div>
      </Panel>
      {history.length > 0 && (
        <Panel id="psychotech-history" icon="chart" title={t('psychotech.historyTitle')}>
          <BarList
            label={t('psychotech.historyTitle')}
            items={history.slice(0, 8).map((entry, index) => ({
              label: t('psychotech.historyLabel', {
                date: new Date(entry.at).toLocaleDateString(i18n.language),
                mode: modeLabel(entry.mode),
                level: t(`psychotech.level_${entry.level}`),
              }),
              value: overall(entry.scores),
              valueLabel: `${Math.round(overall(entry.scores) * 100)}%`,
              emphasized: index === 0,
            }))}
          />
        </Panel>
      )}
    </div>
  )
}

type RunnerProps = {
  session: Session
  onFinish: (answers: Answer[], timedOut: boolean) => void
  onQuit: () => void
}

function Runner({ session, onFinish, onQuit }: RunnerProps) {
  const { t } = useTranslation()
  const [answers, setAnswers] = useState<Answer[]>([])
  const [questionStartedAt, setQuestionStartedAt] = useState(session.startedAt)
  const [now, setNow] = useState(session.startedAt)
  const { questions, mode, level } = session
  const question = questions[answers.length]
  const full = mode === 'full'
  const sessionLeftAt = (at: number) => FULL_SECONDS - (at - session.startedAt) / 1000
  const attentionLeftAt = (at: number) => ATTENTION_SECONDS[level] - (at - questionStartedAt) / 1000
  const sessionLeft = sessionLeftAt(now)
  const attentionLeft = attentionLeftAt(now)

  const record = (answer: Answer) => {
    const next = [...answers, answer]
    if (next.length === questions.length) return onFinish(next, false)
    setAnswers(next)
    setQuestionStartedAt(Date.now())
  }

  // Each tick of the clock checks the time limits, so running out of time is handled where time passes.
  const onTick = useEffectEvent((at: number) => {
    if (!question) return
    if (full && sessionLeftAt(at) <= 0) {
      // Out of time: what was not answered counts as wrong.
      const rest = questions
        .slice(answers.length)
        .map((item) => ({ skill: item.skill, correct: false, ms: null }))
      onFinish([...answers, ...rest], true)
    } else if (question.skill === 'attention' && attentionLeftAt(at) <= 0) {
      record({ skill: 'attention', correct: false, ms: null })
    }
  })

  useEffect(() => {
    const timer = window.setInterval(() => {
      const at = Date.now()
      setNow(at)
      onTick(at)
    }, 250)
    return () => window.clearInterval(timer)
  }, [])

  if (!question) return null

  const answer = (index: number) =>
    record({ skill: question.skill, correct: index === question.answer, ms: Date.now() - questionStartedAt })

  const timer =
    question.skill === 'attention'
      ? { label: t('psychotech.questionLeft'), value: clock(attentionLeft) }
      : full
        ? { label: t('psychotech.timeLeft'), value: clock(sessionLeft) }
        : { label: t('psychotech.elapsed'), value: clock((now - questionStartedAt) / 1000) }

  return (
    <Panel
      id="psychotech-question"
      icon="brain"
      title={`${t(`psychotech.skill_${question.skill}`)} · ${t('assessment.progress', { current: answers.length + 1, total: questions.length })}`}
      action={
        <span className="text-right text-xs font-light text-muted">
          {timer.label}{' '}
          <span className="text-base font-semibold text-night tabular-nums" role="timer">
            {timer.value}
          </span>
          {full && question.skill === 'attention' && (
            <span className="block tabular-nums">
              {t('psychotech.timeLeft')} {clock(sessionLeft)}
            </span>
          )}
        </span>
      }
    >
      <ProgressBar
        value={answers.length / questions.length}
        label={t('assessment.progress', { current: answers.length + 1, total: questions.length })}
        className="mb-5"
      />
      <QuestionView key={answers.length} question={question} onAnswer={answer} />
      <Button variant="ghost" size="sm" className="mt-6" onClick={onQuit}>
        {t('psychotech.quit')}
      </Button>
    </Panel>
  )
}

type ResultProps = { finished: Finished; onAgain: () => void; onTrain: (mode: Mode) => void }

function Result({ finished, onAgain, onTrain }: ResultProps) {
  const { t } = useTranslation()
  const [sharing, setSharing] = useState(false)
  const { profile } = useUser()
  const { scores } = finished
  const rows = SKILLS.flatMap((skill) => {
    const entry = scores[skill]
    return entry ? [{ skill, entry }] : []
  })
  const weak = weakSkills(scores)
  const totals = rows.reduce(
    (sum, { entry }) => ({ correct: sum.correct + entry.correct, total: sum.total + entry.total }),
    { correct: 0, total: 0 },
  )
  const skillName = (skill: Skill) => t(`psychotech.skill_${skill}`)

  /** A story image with the score, for the person to post: the app's best advertising. */
  const shareStory = async () => {
    setSharing(true)
    try {
      const url = `${window.location.host}/treino`
      const blob = await storyImage({
        name: profile?.name.trim().split(/\s+/).slice(0, 2).join(' ') ?? '',
        kicker: t('psychotech.title'),
        score: `${Math.round(overall(scores) * 100)}%`,
        summary: t('psychotech.storySummary', {
          ...totals,
          mode: t(finished.mode === 'full' ? 'psychotech.mode_full' : `psychotech.skill_${finished.mode}`),
          level: t(`psychotech.level_${finished.level}`),
        }),
        skills: rows.map(({ skill, entry }) => ({
          label: skillName(skill),
          value: share(entry),
          valueLabel: `${entry.correct}/${entry.total}`,
        })),
        cta: t('psychotech.storyCta'),
        url,
      })
      if (blob) await shareFile(blob, 'kaye-psicotecnico.png', t('psychotech.shareText', { url }))
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="space-y-4">
      <Panel id="psychotech-result" icon="chart" title={t('psychotech.resultTitle')}>
        <p className="mb-4 text-base font-normal text-night">
          {t('psychotech.resultSummary', totals)} {finished.timedOut && t('psychotech.timeUp')}
        </p>
        <BarList
          label={t('psychotech.scoresLabel')}
          items={rows.map(({ skill, entry }) => ({
            label: skillName(skill),
            value: share(entry),
            valueLabel: t('psychotech.scoreValue', {
              correct: entry.correct,
              total: entry.total,
              seconds: averageSeconds(entry).toFixed(1),
            }),
            emphasized: weak.includes(skill),
          }))}
        />
      </Panel>
      <Panel id="psychotech-tips" icon="target" title={t('psychotech.tipsTitle')}>
        {weak.length === 0 ? (
          <p className="text-sm font-light text-copy">{t('psychotech.noTips')}</p>
        ) : (
          <div className="space-y-4">
            {weak.map((skill) => (
              <div key={skill}>
                <h3 className="text-sm font-semibold text-night">{skillName(skill)}</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm font-light text-copy">
                  {TIPS.map((n) => (
                    <li key={n}>{t(`psychotech.tip_${skill}_${n}`)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => void shareStory()} disabled={sharing}>
          <Icon name="share" className="size-4" />
          {t('psychotech.share')}
        </Button>
        <Button variant="secondary" onClick={onAgain}>
          {t('psychotech.again')}
        </Button>
        {weak[0] && (
          <Button variant="secondary" onClick={() => onTrain(weak[0])}>
            {t('psychotech.trainSkill', { skill: skillName(weak[0]) })}
          </Button>
        )}
      </div>
    </div>
  )
}
