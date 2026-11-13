import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { TextAreaField } from '../../components/ui/Field'
import { Panel } from '../../components/ui/Panel'
import { ProgressBar } from '../../components/ui/ProgressBar'
import type { InterviewQuestion } from '../../data/demo/interviews'
import { ANSWER_SECONDS, type InterviewAnswer, THINK_SECONDS } from '../../domain/interviews'
import { useDictation } from '../../lib/useDictation'

type Phase = 'think' | 'answer'

const clock = (seconds: number) => {
  const whole = Math.max(0, Math.ceil(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

type RunnerProps = {
  questions: InterviewQuestion[]
  onFinish: (answers: InterviewAnswer[]) => void
  onQuit: () => void
}

/** One question at a time: 30 s to think, 2 min to answer (typed or dictated), then the next. */
export function InterviewRunner({ questions, onFinish, onQuit }: RunnerProps) {
  const { t } = useTranslation()
  const [answers, setAnswers] = useState<InterviewAnswer[]>([])
  const index = answers.length
  const question = questions[index]
  if (!question) return null

  const next = (answer: InterviewAnswer) => {
    const all = [...answers, answer]
    if (all.length === questions.length) onFinish(all)
    else setAnswers(all)
  }

  return (
    <Panel
      id="interview-question"
      icon="message"
      title={t('assessment.progress', { current: index + 1, total: questions.length })}
    >
      <ProgressBar
        value={index / questions.length}
        label={t('assessment.progress', { current: index + 1, total: questions.length })}
        className="mb-5"
      />
      <Step key={question.id} question={question} last={index === questions.length - 1} onDone={next} />
      <Button variant="ghost" size="sm" className="mt-6" onClick={onQuit}>
        {t('interviews.quit')}
      </Button>
    </Panel>
  )
}

type StepProps = { question: InterviewQuestion; last: boolean; onDone: (answer: InterviewAnswer) => void }

function Step({ question, last, onDone }: StepProps) {
  const { t, i18n } = useTranslation()
  const [phase, setPhase] = useState<Phase>('think')
  const [phaseStartedAt, setPhaseStartedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [text, setText] = useState('')
  const dictated = useRef(false)
  const dictation = useDictation(i18n.language, (heard) => {
    if (!heard) return
    dictated.current = true
    setText((current) => (current.trim() ? `${current.trimEnd()} ${heard}` : heard))
  })
  const answerSeconds = question.answerSeconds ?? ANSWER_SECONDS
  const limit = phase === 'think' ? THINK_SECONDS : answerSeconds
  const leftAt = (at: number) => limit - (at - phaseStartedAt) / 1000
  const left = leftAt(now)

  const answer = () => {
    setPhase('answer')
    setPhaseStartedAt(Date.now())
    setNow(Date.now())
  }
  const done = () => {
    dictation.stop()
    onDone({
      questionId: question.id,
      question: question.text,
      answer: text.trim(),
      seconds: Math.min(answerSeconds, (Date.now() - phaseStartedAt) / 1000),
      dictated: dictated.current,
    })
  }

  // Each tick of the clock checks the limit, so the phase ends where time passes.
  const onTick = useEffectEvent((at: number) => {
    if (leftAt(at) > 0) return
    if (phase === 'think') answer()
    else done()
  })

  useEffect(() => {
    const timer = window.setInterval(() => {
      const at = Date.now()
      setNow(at)
      onTick(at)
    }, 250)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div>
      {question.kind && <Chip className="mb-3">{t(`interviews.kind_${question.kind}`)}</Chip>}
      <p className="font-display text-xl leading-snug font-bold text-night sm:text-2xl">{question.text}</p>

      <div className="mt-4 flex items-center gap-3 text-sm font-light text-muted">
        <Icon name="clock" className="size-4 shrink-0" />
        <span>{t(phase === 'think' ? 'interviews.thinkLeft' : 'interviews.answerLeft')}</span>
        <span className="text-base font-semibold text-night tabular-nums" role="timer">
          {clock(left)}
        </span>
      </div>

      {phase === 'think' ? (
        <div className="mt-5 space-y-3">
          <p className="text-sm font-light text-copy">{t('interviews.thinkBody')}</p>
          <Button onClick={answer}>{t('interviews.startAnswer')}</Button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <TextAreaField
            label={t('interviews.writeLabel')}
            hint={t(dictation.supported ? 'interviews.writeHintVoice' : 'interviews.writeHint')}
            value={dictation.interim ? `${text}${text ? ' ' : ''}${dictation.interim}` : text}
            rows={7}
            onChange={(event) => setText(event.target.value)}
            readOnly={dictation.listening}
          />
          {dictation.error && <p className="text-sm font-light text-coral">{t('interviews.micDenied')}</p>}
          <div className="flex flex-wrap gap-3">
            {dictation.supported && (
              <Button
                variant={dictation.listening ? 'danger' : 'secondary'}
                aria-pressed={dictation.listening}
                onClick={dictation.listening ? dictation.stop : dictation.start}
              >
                {dictation.listening ? (
                  <span aria-hidden="true" className="size-2.5 animate-pulse rounded-full bg-coral" />
                ) : (
                  <Icon name="mic" className="size-4" />
                )}
                {t(dictation.listening ? 'interviews.dictateStop' : 'interviews.dictate')}
              </Button>
            )}
            <Button onClick={done}>{t(last ? 'interviews.finish' : 'interviews.next')}</Button>
          </div>
        </div>
      )}
    </div>
  )
}
