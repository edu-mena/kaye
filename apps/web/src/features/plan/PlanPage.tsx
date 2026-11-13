import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { Icon, type IconName } from '../../components/icons'
import { Loading, RowsSkeleton } from '../../components/PageStates'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { SelectField } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useCareer, useCareers } from '../../data/queries'
import { remainingSteps } from '../../domain/education'
import { myCareers } from '../../domain/path'
import { nextSteps, PHASE_OF, PHASES, type PlanStepKind } from '../../domain/plan'
import { useRecommendations } from '../../lib/useRecommendations'
import { type PlanItem, usePlan, type PlanView } from '../../state/usePlan'
import { userActions, useUser } from '../../state/userStore'
import { usePlanText } from './usePlanText'

const KIND_ICONS: Record<PlanStepKind, IconName> = {
  study: 'cap',
  apply: 'pencil',
  skill: 'book',
  cv: 'document',
  practice: 'brain',
  experience: 'briefcase',
}

/** "O meu plano" (/plano): choose a career and a path, then follow the steps and tick them off. */
export default function PlanPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const linked = params.get('carreira')
  const { view, loading } = usePlan()
  const [changing, setChanging] = useState(false)
  const picking = !view || changing || (linked !== null && linked !== view.plan.career)

  const close = () => {
    setChanging(false)
    if (linked) setParams({}, { replace: true })
  }

  return (
    <>
      <PageHeader compact title={t('plan.title')} subtitle={t('plan.subtitle')} />
      {loading ? (
        <Loading>
          <RowsSkeleton count={4} />
        </Loading>
      ) : picking ? (
        <Picker
          initial={linked ?? view?.plan.career ?? null}
          onDone={close}
          onCancel={view ? close : undefined}
        />
      ) : (
        <PlanBody view={view} onChange={() => setChanging(true)} />
      )}
    </>
  )
}

type PickerProps = { initial: string | null; onDone: () => void; onCancel?: () => void }

function Picker({ initial, onDone, onCancel }: PickerProps) {
  const { t } = useTranslation()
  const user = useUser()
  const { data: careers = [] } = useCareers()
  const recommended = useRecommendations(5) ?? []
  const detailed = careers.filter((career) => career.detailed)
  const mineSlugs = myCareers(user)
  const mine = detailed.filter((career) => mineSlugs.has(career.slug))
  const suggested = recommended
    .map((item) => item.career)
    .filter((career) => career.detailed && !mineSlugs.has(career.slug))
  const [slug, setSlug] = useState<string | null>(initial ?? mine[0]?.slug ?? suggested[0]?.slug ?? null)
  const { data: career } = useCareer(slug ?? '')
  const [pathwayId, setPathwayId] = useState<string | null>(user.plan?.pathway ?? null)
  const education = user.profile?.education ?? null
  const pathway = career?.pathways.find((item) => item.id === pathwayId) ?? career?.pathways[0]

  const choose = (next: string) => {
    setSlug(next)
    setPathwayId(null)
  }

  const chips = (title: string, list: { slug: string; name: string }[]) =>
    list.length > 0 && (
      <div>
        <p className="mb-2 text-xs font-semibold text-muted">{title}</p>
        <div className="flex flex-wrap gap-2">
          {list.map((item) => (
            <button
              key={item.slug}
              type="button"
              aria-pressed={item.slug === slug}
              onClick={() => choose(item.slug)}
              className={`rounded-full px-4 py-2 text-sm transition ${item.slug === slug ? 'bg-night font-normal text-white' : 'bg-ash-100 font-light text-night hover:bg-ash-300/50'}`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    )

  return (
    <div className="space-y-4">
      <Card as="section" aria-labelledby="plan-career" className="space-y-4 p-6">
        <h2 id="plan-career" className="text-lg font-semibold text-night">
          {t('plan.pickCareer')}
        </h2>
        {chips(t('plan.mine'), mine)}
        {chips(t('plan.recommended'), suggested)}
        <SelectField
          label={t('plan.otherCareer')}
          placeholder={t('plan.otherPlaceholder')}
          value={slug ?? ''}
          onChange={(event) => event.target.value && choose(event.target.value)}
          options={detailed
            .toSorted((a, b) => a.name.localeCompare(b.name))
            .map((item) => ({ value: item.slug, label: item.name }))}
        />
      </Card>

      {career && (
        <Card as="section" aria-labelledby="plan-pathway" className="space-y-3 p-6">
          <h2 id="plan-pathway" className="text-lg font-semibold text-night">
            {t('plan.pickPathway')}
          </h2>
          {career.pathways.length === 0 && (
            <p className="text-sm font-light text-copy">{t('plan.noPathways')}</p>
          )}
          <ul className="grid gap-3 sm:grid-cols-2">
            {career.pathways.map((item) => {
              const chosen = item.id === pathway?.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={chosen}
                    onClick={() => setPathwayId(item.id)}
                    className={`h-full w-full rounded-2xl p-4 text-left transition ${chosen ? 'border-2 border-blue bg-surface' : 'border border-line bg-surface hover:border-ash-300'}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-base font-semibold text-night">{item.name}</span>
                      {chosen && <Icon name="check" className="size-5 shrink-0 text-blue" />}
                    </span>
                    <span className="mt-1 block text-sm font-light text-copy">{item.summary}</span>
                    <span className="mt-2 block text-xs font-normal text-muted">
                      {t('plan.pathwaySteps', { count: remainingSteps(item, education).steps.length })}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {user.plan && <p className="text-xs font-light text-muted">{t('plan.changeWarning')}</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              disabled={!pathway}
              onClick={() => {
                if (!pathway) return
                userActions.startPlan(career.slug, pathway.id)
                onDone()
              }}
            >
              {t('plan.start')}
              <Icon name="arrowRight" className="size-4" />
            </Button>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                {t('plan.cancel')}
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

function PlanBody({ view, onChange }: { view: PlanView; onChange: () => void }) {
  const { t } = useTranslation()
  const week = nextSteps(view.items)

  return (
    <div className="space-y-6">
      <Card tone="coal" as="section" aria-labelledby="plan-head" className="p-6">
        <p className="text-xs font-light text-white/70">{view.pathway.name}</p>
        <h2 id="plan-head" className="mt-1 text-2xl font-extrabold">
          <Link to={`/carreiras/${view.career.slug}`} className="underline-offset-4 hover:underline">
            {view.career.name}
          </Link>
        </h2>
        <p className="mt-3 text-sm font-normal">
          {t('plan.progress', { done: view.done, total: view.items.length })}
        </p>
        <ProgressBar
          className="mt-2"
          tone="gold"
          track="bg-white/15"
          value={view.items.length ? view.done / view.items.length : 0}
          label={t('plan.title')}
        />
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="onDarkOutline" size="sm" onClick={onChange}>
            <Icon name="refresh" className="size-4" />
            {t('plan.change')}
          </Button>
          <Button variant="onDarkOutline" size="sm" onClick={() => userActions.clearPlan()}>
            <Icon name="trash" className="size-4" />
            {t('plan.clear')}
          </Button>
        </div>
      </Card>

      <section aria-labelledby="plan-week" className="space-y-3">
        <h2 id="plan-week" className="text-lg font-semibold text-night">
          {t('plan.week')}
        </h2>
        {week.length === 0 ? (
          <Card>
            <p className="text-sm font-light text-copy">{t('plan.weekEmpty')}</p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {week.map((item) => (
              <li key={item.step.id}>
                <StepRow item={item} today={view.today} highlight />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="plan-all" className="space-y-5">
        <h2 id="plan-all" className="text-lg font-semibold text-night">
          {t('plan.all')}
        </h2>
        {PHASES.map((phase) => {
          const items = view.items.filter((item) => PHASE_OF[item.step.kind] === phase)
          if (items.length === 0) return null
          const done = items.filter((item) => item.status === 'done').length
          return (
            <div key={phase} className="space-y-2">
              <h3 className="flex items-center justify-between gap-2 text-sm font-semibold text-night">
                {t(`plan.phase_${phase}`)}
                <span className="text-xs font-light text-muted">
                  {done}/{items.length}
                </span>
              </h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.step.id}>
                    <StepRow item={item} today={view.today} />
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </section>
    </div>
  )
}

function StepRow({ item, today, highlight = false }: { item: PlanItem; today: string; highlight?: boolean }) {
  const { t, i18n } = useTranslation()
  const text = usePlanText()
  const { step, status } = item
  const external = step.to.startsWith('http')
  const date = step.due
    ? new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' }).format(
        new Date(`${step.due}T12:00:00`),
      )
    : null
  const soon = step.due !== undefined && status === 'todo' && step.due <= addDays(today, 7)

  return (
    <Card
      as="article"
      tone={highlight ? 'notice' : 'surface'}
      className={`flex flex-wrap items-start gap-3 p-4 ${status === 'done' ? 'opacity-75' : ''}`}
    >
      <span
        aria-hidden="true"
        className={`grid size-9 shrink-0 place-items-center rounded-full ${status === 'done' ? 'bg-success text-white' : 'bg-blue text-white'}`}
      >
        <Icon name={status === 'done' ? 'check' : KIND_ICONS[step.kind]} className="size-4" />
      </span>
      <div className="min-w-0 flex-1 basis-56">
        <h3
          className={`text-sm leading-snug font-semibold text-night ${status === 'done' ? 'line-through decoration-1' : ''}`}
        >
          {text(step.title)}
        </h3>
        <p className="mt-0.5 text-sm font-light text-copy">{text(step.why)}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {date && (
            <Chip tone={soon ? 'gold' : 'neutral'}>
              <Icon name="calendar" className="size-3.5" />
              {t('plan.due', { date })}
            </Chip>
          )}
          {status === 'done' && <Chip tone="success">{item.auto ? t('plan.autoDone') : t('plan.done')}</Chip>}
          {status === 'missed' && <Chip tone="coral">{t('plan.missed')}</Chip>}
        </div>
      </div>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-col sm:items-end">
        {external ? (
          <a
            href={step.to}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm text-night hover:bg-ash-100"
          >
            {t('plan.go')}
            <Icon name="external" className="size-4" />
            <span className="sr-only">{t('plan.external')}</span>
          </a>
        ) : (
          <ButtonLink to={step.to} variant="secondary" size="sm">
            {t('plan.go')}
            <Icon name="arrowRight" className="size-4" />
          </ButtonLink>
        )}
        {!item.auto && (
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={status === 'done'}
            onClick={() => userActions.togglePlanStep(step.id)}
          >
            <Icon name="check" className="size-4" />
            {status === 'done' ? t('plan.undo') : t('plan.markDone')}
          </Button>
        )}
      </div>
    </Card>
  )
}

/** An ISO day some days later. */
function addDays(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10)
}
