import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { Dialog } from '../../components/ui/Dialog'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { courseSteps, REVIEW, stepKey } from '../../data/kursos'
import type { Course } from '../../data/kursos/types'
import { usePersistentFlag } from '../../lib/usePersistentFlag'
import type { KursoProgress } from '../../state/userStore'
import { stepHref } from './shared'
import { TestBanner } from './TestBanner'

type ReaderProps = {
  course: Course
  progress: KursoProgress
  title: string
  /** 0 to 1. */
  share: number
  /** The step open, for the contents; absent in the exam (no contents). */
  current?: string
  footer: ReactNode
  children: ReactNode
}

/** The Kursos reader: no app bars, a top bar of its own, contents on the left, ~70 characters a line. */
export function Reader({ course, progress, title, share, current, footer, children }: ReaderProps) {
  const { t } = useTranslation()
  const [tocOpen, setTocOpen] = usePersistentFlag('kaye.kursos.toc', true)
  const [drawer, setDrawer] = useState(false)
  const label = t('kursos.progress', { value: Math.round(share * 100) })

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-3 px-3 py-2.5 lg:px-5">
          <Link
            to={`/kursos/${course.id}`}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-ash-100 text-night hover:bg-ash-200"
          >
            <Icon name="arrowLeft" className="size-5" />
            <span className="sr-only">{t('kursos.back')}</span>
          </Link>
          {current && (
            <button
              type="button"
              onClick={() =>
                window.matchMedia('(min-width: 64rem)').matches ? setTocOpen(!tocOpen) : setDrawer(true)
              }
              aria-expanded={tocOpen}
              className="grid size-10 shrink-0 place-items-center rounded-full text-night hover:bg-ash-100"
            >
              <Icon name="panel" className="size-5" />
              <span className="sr-only">{t('kursos.contents')}</span>
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted">{course.title}</p>
            <h1 className="truncate text-sm font-semibold text-night sm:text-base">{title}</h1>
          </div>
          <div className="hidden w-40 sm:block">
            <ProgressBar value={share} label={label} />
          </div>
          <span className="text-xs font-semibold text-night">{Math.round(share * 100)}%</span>
        </div>
        <TestBanner />
      </header>

      <div className="flex flex-1">
        {current && tocOpen && (
          <aside className="sticky top-24 hidden max-h-[calc(100dvh-7rem)] w-72 shrink-0 overflow-y-auto border-r border-line px-4 py-6 lg:block">
            <Contents course={course} progress={progress} current={current} />
          </aside>
        )}
        <article className="mx-auto w-full max-w-[70ch] px-4 pt-6 pb-32 sm:px-6 lg:pt-10">{children}</article>
      </div>

      <footer className="sticky bottom-0 z-20 border-t border-line bg-surface px-3 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div className="mx-auto flex max-w-[70ch] items-center justify-between gap-3">{footer}</div>
      </footer>

      {current && (
        <Dialog open={drawer} onClose={() => setDrawer(false)} title={t('kursos.contents')} variant="drawer">
          <Contents
            course={course}
            progress={progress}
            current={current}
            dark
            onNavigate={() => setDrawer(false)}
          />
        </Dialog>
      )}
    </div>
  )
}

type ContentsProps = {
  course: Course
  progress: KursoProgress
  current: string
  dark?: boolean
  onNavigate?: () => void
}

function Contents({ course, progress, current, dark = false, onNavigate }: ContentsProps) {
  const { t } = useTranslation()
  const steps = courseSteps(course)
  return (
    <nav aria-label={t('kursos.contents')}>
      {course.units
        .filter((unit) => unit.load)
        .map((unit) => (
          <div key={unit.id} className="mb-6">
            <p className={`mb-2 text-xs font-semibold ${dark ? 'text-gold' : 'text-muted'}`}>
              {t('kursos.unitN', { n: unit.number })} · {unit.title}
            </p>
            <ul className="space-y-1">
              {steps
                .filter((step) => step.unit === unit.id)
                .map((step) => {
                  const key = stepKey(step)
                  const done = progress.done.includes(key)
                  const active = key === current
                  const name =
                    step.lesson === REVIEW
                      ? t('kursos.review')
                      : (unit.lessons?.find((lesson) => lesson.id === step.lesson)?.title ?? '')
                  return (
                    <li key={key}>
                      <Link
                        to={stepHref(course, step)}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                          dark
                            ? active
                              ? 'bg-white/15 text-white'
                              : 'text-white hover:bg-white/5'
                            : active
                              ? 'bg-night text-white'
                              : 'text-night hover:bg-ash-100'
                        }`}
                      >
                        <Icon
                          name={done ? 'check' : step.lesson === REVIEW ? 'award' : 'book'}
                          className={`size-4 shrink-0 ${done ? 'text-success' : dark || active ? 'text-gold' : 'text-muted'}`}
                        />
                        <span className="min-w-0 flex-1">{name}</span>
                      </Link>
                    </li>
                  )
                })}
            </ul>
          </div>
        ))}
    </nav>
  )
}
