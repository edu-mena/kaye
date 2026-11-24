import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { InstitutionLogo } from '../../components/InstitutionLogo'
import { PhotoImg } from '../../components/PhotoImg'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { KURSOS } from '../../data/kursos'
import { useAcademies, useCareers, useCompanies, useNews } from '../../data/queries'
import { formatPercent } from '../../domain/format'
import type { FeedItem, FeedReason } from '../../domain/feed'
import { courseState } from '../../domain/kursos'
import { EMPTY_KURSO, userActions, useUser } from '../../state/userStore'
import { useDeadlines } from '../../state/useDeadlines'
import { DeadlineRow } from '../deadlines/DeadlineRow'
import { NoDegreeCard } from '../noDegree/NoDegreeCard'
import { newsHref } from '../news/links'
import { PlanCard } from '../plan/PlanCard'
import { PlusCard } from '../plus/PlusCard'
import { resumeStep, stepHref } from '../kursos/shared'
import { CARD_LINK, CardHeading } from './CardHeading'

const ROUND =
  'grid size-9 place-items-center rounded-full border border-line bg-surface text-night hover:bg-ash-100'

function useReasonText() {
  const { t } = useTranslation()
  return (reason: FeedReason | undefined) => {
    switch (reason?.kind) {
      case 'area':
        return t('forYou.reasonArea', { area: t(`market.area_${reason.area}`) })
      case 'target':
        return t('forYou.reasonTarget')
      case 'saved':
        return t('forYou.reasonSaved')
      case 'recommended':
        return t('forYou.reasonRecommended')
      default:
        return null
    }
  }
}

type SaveProps = { saved: boolean; onToggle: () => void }

/** The row under a card: its main action, "Guardar" when the kind can be saved, and "Não me interessa". */
function Actions({ id, save, children }: { id: string; save?: SaveProps; children?: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="mt-4 flex items-center gap-2">
      {children}
      {save && (
        <button
          type="button"
          aria-pressed={save.saved}
          aria-label={save.saved ? t('forYou.unsave') : t('forYou.save')}
          onClick={save.onToggle}
          className={ROUND}
        >
          <Icon name="bookmark" className={`size-4 ${save.saved ? 'fill-night' : ''}`} />
        </button>
      )}
      <button
        type="button"
        aria-label={t('forYou.dismiss')}
        onClick={() => userActions.dismiss(id)}
        className={`${ROUND} ml-auto`}
      >
        <Icon name="close" className="size-4" />
      </button>
    </div>
  )
}

function Reason({ reason }: { reason: FeedReason | undefined }) {
  const text = useReasonText()(reason)
  return text ? <p className="mt-1 text-xs font-light text-muted">{text}</p> : null
}

type Item<T extends FeedItem['type']> = Extract<FeedItem, { type: T }>

function CareerFeedCard({ item }: { item: Item<'career'> }) {
  const { t } = useTranslation()
  const { data: careers = [] } = useCareers()
  const { savedCareers } = useUser()
  const reason = useReasonText()(item.reason)
  const career = careers.find((entry) => entry.slug === item.career)
  if (!career) return null
  return (
    <Card as="article" aria-label={career.name} className="overflow-hidden p-0">
      <Link to={`/carreiras/${career.slug}`} className="relative block h-48 bg-night">
        {career.image && (
          <PhotoImg
            photo={career.image}
            sizes="(min-width: 1024px) 30vw, 100vw"
            className="size-full object-cover"
          />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-coal via-coal/50 to-transparent" />
        <span className="absolute inset-x-5 bottom-4 text-white">
          <span className="block text-xs font-light text-white/80">{t('forYou.careerLabel')}</span>
          <span className="block text-2xl leading-tight font-extrabold">{career.name}</span>
        </span>
      </Link>
      <div className="p-5">
        <p className="text-sm font-light text-copy">{reason ?? career.summary}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip tone={career.demand === 'alta' ? 'success' : 'neutral'}>{t(`demand.${career.demand}`)}</Chip>
        </div>
        <Actions
          id={item.id}
          save={{
            saved: savedCareers.includes(career.slug),
            onToggle: () => userActions.toggleSaved(career.slug),
          }}
        >
          <ButtonLink to={`/carreiras/${career.slug}`} size="sm">
            {t('forYou.seeCareer')}
          </ButtonLink>
        </Actions>
      </div>
    </Card>
  )
}

/** A list of institutions or companies under a title, each linking to its page. */
function InstitutionRows({
  rows,
}: {
  rows: { id: string; to: string; name: string; logo?: string; logoOnDark?: boolean; meta: string }[]
}) {
  return (
    <ul className="mt-3 divide-y divide-line">
      {rows.map((row) => (
        <li key={row.id}>
          <Link to={row.to} className="flex items-center gap-3 py-3">
            <InstitutionLogo institution={row} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-normal text-night">{row.name}</span>
              <span className="block text-xs font-light text-muted">{row.meta}</span>
            </span>
            <Icon name="chevronRight" className="size-4 shrink-0 text-muted" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

function WhoHiresCard({ item }: { item: Item<'whoHires'> }) {
  const { t } = useTranslation()
  const { data: careers = [] } = useCareers()
  const { data: companies = [] } = useCompanies()
  const career = careers.find((entry) => entry.slug === item.career)
  const rows = item.companies.flatMap((id) => companies.find((company) => company.id === id) ?? [])
  if (!career || rows.length === 0) return null
  return (
    <Card as="article" aria-label={t('forYou.whoHiresTitle')} className="p-5">
      <CardHeading
        icon="building"
        action={
          <Link to="/empresas" className={CARD_LINK}>
            {t('common.seeAll')}
          </Link>
        }
      >
        {t('forYou.whoHiresTitle')}
      </CardHeading>
      <p className="mt-3 text-sm font-light text-copy">{t('forYou.whoHiresBody', { career: career.name })}</p>
      <InstitutionRows
        rows={rows.map((company) => ({
          id: company.id,
          name: company.name,
          logo: company.logo,
          logoOnDark: company.logoOnDark,
          to: `/empresas/${company.id}?profissao=${career.slug}`,
          meta: t('forYou.companyCareers', { count: company.careers.length }),
        }))}
      />
      <Reason reason={item.reason} />
      <Actions id={item.id}>
        <ButtonLink to="/empresas" variant="secondary" size="sm">
          {t('forYou.whoHiresAll')}
        </ButtonLink>
      </Actions>
    </Card>
  )
}

function WhereToStudyCard({ item }: { item: Item<'whereToStudy'> }) {
  const { t } = useTranslation()
  const { data: careers = [] } = useCareers()
  const { data: academies = [] } = useAcademies()
  const career = careers.find((entry) => entry.slug === item.career)
  const rows = item.academies.flatMap((id) => academies.find((academy) => academy.id === id) ?? [])
  if (!career || rows.length === 0) return null
  return (
    <Card as="article" aria-label={t('forYou.studyTitle')} className="p-5">
      <CardHeading
        icon="landmark"
        action={
          <Link to="/academias" className={CARD_LINK}>
            {t('common.seeAll')}
          </Link>
        }
      >
        {t('forYou.studyTitle')}
      </CardHeading>
      <p className="mt-3 text-sm font-light text-copy">{t('forYou.studyBody', { career: career.name })}</p>
      <InstitutionRows
        rows={rows.map((academy) => ({
          id: academy.id,
          name: academy.name,
          logo: academy.logo,
          to: `/academias/${academy.id}?carreira=${career.slug}`,
          meta: t('forYou.academyCourses', {
            count: academy.offers.filter((offer) => offer.careers.includes(career.slug)).length,
          }),
        }))}
      />
      <Reason reason={item.reason} />
      <Actions id={item.id} />
    </Card>
  )
}

function DeadlineFeedCard({ item }: { item: Item<'deadline'> }) {
  const { t } = useTranslation()
  const { all, today } = useDeadlines()
  const deadline = all.find((entry) => entry.id === item.deadline)
  if (!deadline) return null
  return (
    <Card as="article" aria-label={t('forYou.deadlineTitle')} className="p-5">
      <CardHeading
        icon="calendar"
        action={
          <Link to="/prazos" className={CARD_LINK}>
            {t('forYou.deadlineAll')}
          </Link>
        }
      >
        {t('forYou.deadlineTitle')}
      </CardHeading>
      <div className="mt-4">
        <DeadlineRow item={deadline} today={today} compact />
      </div>
      <Actions id={item.id} />
    </Card>
  )
}

function FactCard({ item }: { item: Item<'fact'> }) {
  const { t } = useTranslation()
  const { fact } = item
  return (
    <Card as="article" tone="coal" aria-label={t('forYou.factLabel')} className="p-5">
      <p className="text-xs font-light text-white/80">{t('forYou.factLabel')}</p>
      <p className="mt-2 font-display text-5xl font-extrabold">{formatPercent(fact.share)}</p>
      <p className="mt-2 max-w-xs text-sm font-light text-white/80">
        {fact.kind === 'areaShare'
          ? t('forYou.factAreaShare', { area: t(`market.area_${fact.area}`) })
          : t('forYou.factNoExperience')}
      </p>
      <ButtonLink to="/mercado" variant="onDark" size="sm" className="mt-4">
        {t('forYou.factCta')}
        <Icon name="arrowRight" className="size-4" />
      </ButtonLink>
    </Card>
  )
}

function NewsFeedCard({ item }: { item: Item<'news'> }) {
  const { t, i18n } = useTranslation()
  const { data: news = [] } = useNews()
  const piece = news.find((entry) => entry.id === item.news)
  const reason = useReasonText()(item.reason)
  if (!piece) return null
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' })
  return (
    <Card as="article" aria-label={piece.title} className="overflow-hidden p-0">
      <Link to={newsHref(piece)} className="block">
        {piece.image && (
          <span className="block h-36 overflow-hidden bg-night">
            <PhotoImg
              photo={piece.image}
              sizes="(min-width: 1024px) 30vw, 100vw"
              className="size-full object-cover"
            />
          </span>
        )}
        <span className="block p-5 pb-0">
          <span className="block text-xs font-light text-muted">
            {t('nav.news')} · {date.format(new Date(`${piece.date}T12:00:00`))}
          </span>
          <span className="mt-1 line-clamp-2 block text-base font-semibold text-night">{piece.title}</span>
        </span>
      </Link>
      <div className="px-5 pb-5">
        {reason && <p className="mt-1 text-xs font-light text-muted">{reason}</p>}
        <Actions id={item.id}>
          <ButtonLink to={newsHref(piece)} variant="secondary" size="sm">
            {t('common.continue')}
          </ButtonLink>
        </Actions>
      </div>
    </Card>
  )
}

function OpportunityCard({ item }: { item: Item<'opportunity'> }) {
  const { t } = useTranslation()
  const key = item.kind === 'bolsa' ? 'forYou.opportunityBolsa' : 'forYou.opportunityEstagio'
  return (
    <Card as="article" aria-label={t('forYou.opportunityTitle')} className="p-5">
      <CardHeading icon="award">{t('forYou.opportunityTitle')}</CardHeading>
      <p className="mt-3 text-sm font-normal text-night">{t(key, { count: item.count })}</p>
      <Actions id={item.id}>
        <ButtonLink
          to={`/oportunidades?tab=${item.kind === 'bolsa' ? 'bolsas' : 'estagios'}`}
          variant="secondary"
          size="sm"
        >
          {t('forYou.opportunityCta')}
        </ButtonLink>
      </Actions>
    </Card>
  )
}

function KursoCard({ item }: { item: Item<'kurso'> }) {
  const { t } = useTranslation()
  const { kursos } = useUser()
  const course = KURSOS.find((entry) => entry.id === item.course)
  if (!course) return null
  const progress = kursos[course.id] ?? EMPTY_KURSO
  const state = courseState(course, progress.done)
  const step = resumeStep(course, progress)
  const label =
    progress.done.length > 0
      ? t('home.kursosContinue', { course: course.title })
      : t('home.kursosStart', { course: course.title })
  return (
    <Card as="article" aria-label={course.title} className="p-5">
      <CardHeading icon="cap">{t('forYou.kursoLabel')}</CardHeading>
      <p className="mt-3 text-base font-semibold text-night">{course.title}</p>
      <ProgressBar value={state.share} label={course.title} className="mt-3" />
      <p className="mt-2 text-xs font-light text-muted">
        {t('home.kursosProgress', { value: formatPercent(state.share) })}
      </p>
      <Actions id={item.id}>
        <ButtonLink to={step ? stepHref(course, step) : `/kursos/${course.id}`} size="sm">
          {label}
        </ButtonLink>
      </Actions>
    </Card>
  )
}

/** One card of the feed. The plan and the "no degree" cards bring their own content. */
export function FeedCard({ item }: { item: FeedItem }) {
  switch (item.type) {
    case 'career':
      return <CareerFeedCard item={item} />
    case 'whoHires':
      return <WhoHiresCard item={item} />
    case 'whereToStudy':
      return <WhereToStudyCard item={item} />
    case 'deadline':
      return <DeadlineFeedCard item={item} />
    case 'fact':
      return <FactCard item={item} />
    case 'news':
      return <NewsFeedCard item={item} />
    case 'opportunity':
      return <OpportunityCard item={item} />
    case 'kurso':
      return <KursoCard item={item} />
    case 'plan':
      return <PlanCard />
    case 'plus':
      return <PlusCard onDismiss={() => userActions.dismiss(item.id)} />
    case 'noDegree':
      return <NoDegreeCard onDismiss={() => userActions.dismiss(item.id)} />
  }
}
