import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { CareerCard } from '../../components/CareerCard'
import { CareerRow } from '../../components/CareerRow'
import { Icon, type IconName } from '../../components/icons'
import { InstitutionLogo } from '../../components/InstitutionLogo'
import { CardsSkeleton, ErrorState, Loading } from '../../components/PageStates'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { Hexagon } from '../../components/ui/Hexagon'
import { SectionHeading } from '../../components/ui/PageHeader'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Rows, Soon } from '../../components/ui/Rows'
import { useAcademies, useCareers, usePrograms } from '../../data/queries'
import type { Institution } from '../../data/types'
import { achievements, totalXp } from '../../domain/achievements'
import { bestCvCompleteness } from '../../domain/cv'
import { isMinor } from '../../domain/education'
import { rankDimensions, riasecCode } from '../../domain/riasec'
import { scorePrograms } from '../../domain/ranking'
import { useRiasecProfile } from '../../state/useRiasecProfile'
import { userActions, useUser, type HistoryEvent } from '../../state/userStore'
import { ProfileForm } from '../onboarding/ProfileForm'
import {
  EraseButton,
  ExportButton,
  LanguagePicker,
  LegalLinks,
  ServiceStatus,
} from '../settings/SettingsParts'
import { ProgramCard } from '../training/ProgramCard'

// ---------- Resumo ----------

export function Overview() {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <TestResult />
        <Target />
      </div>
      <Saved />
      <Achievements />
    </div>
  )
}

function TestResult() {
  const { t } = useTranslation()
  const { profile, completed } = useRiasecProfile()
  return (
    <section aria-labelledby="profile-test">
      <SectionHeading id="profile-test" title={t('profile.test')} icon="target" />
      {completed && profile ? (
        <div className="flex flex-wrap items-center gap-6">
          <ul className="flex gap-2">
            {rankDimensions(profile)
              .slice(0, 3)
              .map((key, index) => (
                <li key={key} className="flex flex-col items-center gap-2">
                  <Hexagon tone={index === 0 ? 'gold' : 'dark'} size="sm">
                    {key}
                  </Hexagon>
                  <span className="text-xs font-light text-muted">{t(`riasec.${key}`)}</span>
                </li>
              ))}
          </ul>
          <div>
            <p className="text-xs font-light text-muted">{t('profile.testCode')}</p>
            <Link
              to="/teste/resultado"
              className="mt-1 block font-display text-3xl font-extrabold text-night underline-offset-4 hover:underline"
            >
              {riasecCode(profile)}
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-ash-100 p-5">
          <p className="text-sm font-light text-copy">{t('profile.testNone')}</p>
          <ButtonLink to="/teste" size="sm" className="mt-4">
            {t('profile.testStart')}
          </ButtonLink>
        </div>
      )}
    </section>
  )
}

function Target() {
  const { t } = useTranslation()
  const { targetCareer } = useUser()
  const { data: careers = [] } = useCareers()
  const career = careers.find((item) => item.slug === targetCareer)
  return (
    <section aria-labelledby="profile-target">
      <SectionHeading id="profile-target" title={t('profile.targetTitle')} icon="compass" />
      {career ? (
        <div className="max-w-sm">
          <CareerCard career={career} brief />
        </div>
      ) : (
        <div className="rounded-2xl bg-ash-100 p-5">
          <p className="text-sm font-light text-copy">{t('profile.targetNone')}</p>
          <ButtonLink to="/carreiras" variant="secondary" size="sm" className="mt-4">
            {t('profile.targetChoose')}
          </ButtonLink>
        </div>
      )}
    </section>
  )
}

/** The first saved career as a card with its photo, the rest as one-line items; then the saved academies. */
function Saved() {
  const { t } = useTranslation()
  const { savedCareers, savedAcademies } = useUser()
  const query = useCareers()
  const { data: academies = [] } = useAcademies()
  const saved = (query.data ?? []).filter((career) => savedCareers.includes(career.slug))
  const places = academies.filter((academy) => savedAcademies.includes(academy.id))
  const [first, ...rest] = saved
  return (
    <section aria-labelledby="profile-saved">
      <SectionHeading id="profile-saved" title={t('profile.saved')} icon="bookmark" />
      {savedCareers.length > 0 && query.isPending ? (
        <Loading>
          <CardsSkeleton count={2} className="md:grid-cols-2 xl:grid-cols-2" />
        </Loading>
      ) : query.isError ? (
        <ErrorState compact onRetry={() => void query.refetch()} />
      ) : !first && places.length === 0 ? (
        <p className="text-sm font-light text-muted">{t('profile.savedNone')}</p>
      ) : (
        <>
          {first && (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:items-start">
              <li className="md:row-span-6">
                <CareerCard career={first} brief />
              </li>
              {rest.map((career) => (
                <li key={career.slug}>
                  <CareerRow career={career} />
                </li>
              ))}
            </ul>
          )}
          {places.length > 0 && (
            <>
              <h3 className={`${first ? 'mt-8' : ''} mb-3 text-sm font-bold text-night`}>
                {t('profile.savedAcademies')}
              </h3>
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {places.map((academy) => (
                  <li key={academy.id}>
                    <Link
                      to={`/academias/${academy.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-line p-3 hover:border-night"
                    >
                      <InstitutionLogo institution={academy} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-night">
                          {academy.name}
                        </span>
                        <span className="block truncate text-xs font-light text-muted">{academy.place}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  )
}

function Achievements() {
  const { t } = useTranslation()
  const user = useUser()
  const list = achievements(user)
  return (
    <section aria-labelledby="achievements">
      <SectionHeading
        id="achievements"
        title={t('profile.achievements')}
        icon="award"
        action={
          <span className="text-sm font-semibold text-gold-ink">{t('common.xp', { xp: totalXp(list) })}</span>
        }
      />
      <p className="-mt-2 mb-6 max-w-prose text-sm font-light text-copy">{t('profile.achievementsBody')}</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {list.map((achievement) => (
          <li
            key={achievement.id}
            className="flex flex-col items-center rounded-2xl border border-line p-4 text-center"
          >
            <Hexagon tone={achievement.earned ? 'gold' : 'locked'} size="sm">
              <Icon name={achievement.earned ? 'check' : 'lock'} className="size-5" />
            </Hexagon>
            <p className="mt-3 text-sm font-semibold text-night">{t(`achievement.${achievement.id}`)}</p>
            <p className="mt-1 text-xs font-light text-muted">
              {achievement.earned ? t(`achievement.${achievement.id}Body`) : t('profile.locked')}
            </p>
            <p className="mt-2 text-xs font-semibold text-gold-ink">
              {t('common.xp', { xp: achievement.xp })}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ---------- Percurso ----------

const EVENT_ICONS: Record<HistoryEvent['type'], IconName> = {
  profile: 'user',
  profileEdit: 'pencil',
  test: 'target',
  visit: 'eye',
  saved: 'bookmark',
  target: 'compass',
  cv: 'document',
  compare: 'cap',
}

/** Every step, newest first, on a line: what happened, when, and a link back to it. */
export function History() {
  const { t, i18n } = useTranslation()
  const { history } = useUser()
  const { data: careers = [] } = useCareers()
  const { data: programs = [] } = usePrograms()
  const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' })

  const about = (event: HistoryEvent): { name: string; to?: string } => {
    if (event.type === 'compare') {
      const program = programs.find((item) => item.id === event.ref)
      return { name: program?.name ?? '', to: program ? `/cursos/${program.id}` : undefined }
    }
    const career = careers.find((item) => item.slug === event.ref)
    return { name: career?.name ?? '', to: career ? `/carreiras/${career.slug}` : undefined }
  }

  return (
    <section aria-labelledby="profile-history">
      <SectionHeading id="profile-history" title={t('profile.historyTitle')} icon="path" />
      <p className="-mt-2 mb-8 max-w-prose text-sm font-light text-copy">{t('profile.historyBody')}</p>
      {history.length === 0 ? (
        <p className="text-sm font-light text-muted">{t('profile.historyNone')}</p>
      ) : (
        <ol className="ml-4 space-y-6 border-l border-line pl-8">
          {history.map((event) => {
            const { name, to } = about(event)
            return (
              <li key={`${event.type}-${event.at}-${event.ref ?? ''}`} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute top-0 -left-[3.05rem] grid size-9 place-items-center rounded-full bg-coal text-gold"
                >
                  <Icon name={EVENT_ICONS[event.type]} className="size-4" />
                </span>
                <p className="text-sm font-semibold text-night">
                  {to ? (
                    <Link to={to} className="underline-offset-4 hover:underline">
                      {t(`profile.event_${event.type}`, { name })}
                    </Link>
                  ) : (
                    t(`profile.event_${event.type}`, { name })
                  )}
                </p>
                <time dateTime={event.at} className="mt-1 block text-xs font-light text-muted">
                  {date.format(new Date(event.at))}
                </time>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

// ---------- Dados pessoais ----------

export function PersonalData() {
  const { t } = useTranslation()
  const { profile } = useUser()
  const [editing, setEditing] = useState(false)
  if (!profile) return null
  const minor = isMinor(profile.birthYear)

  return (
    <section aria-labelledby="profile-personal" className="max-w-3xl">
      <SectionHeading
        id="profile-personal"
        title={t('profile.personalTitle')}
        icon="user"
        action={
          !editing && (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              <Icon name="pencil" className="size-4" />
              {t('profile.edit')}
            </Button>
          )
        }
      />
      <p className="-mt-2 mb-6 max-w-prose text-sm font-light text-copy">{t('profile.personalBody')}</p>
      {editing ? (
        <ProfileForm onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} />
      ) : (
        <Rows
          rows={[
            { label: t('onboarding.name'), value: profile.name },
            { label: t('onboarding.birthYear'), value: profile.birthYear },
            { label: t('onboarding.province'), value: profile.province },
            { label: t('onboarding.education'), value: t(`education.${profile.education}`) },
            ...(minor
              ? [
                  {
                    label: t('profile.guardian'),
                    value: profile.guardianInformed ? t('profile.guardianYes') : t('profile.guardianNo'),
                  },
                ]
              : []),
          ]}
        />
      )}
      <Photos />
      {minor && (
        <Card tone="notice" className="mt-6 flex items-start gap-3 p-5">
          <Icon name="lock" className="mt-0.5 size-4 shrink-0 text-blue" />
          <p className="text-sm font-light text-copy">{t('profile.minorNotice')}</p>
        </Card>
      )}
    </section>
  )
}

/** The profile photo and cover chosen in the hero, each with a way to take it off. */
function Photos() {
  const { t } = useTranslation()
  const { photo, cover } = useUser()
  const remove = (label: string, onClick: () => void) => (
    <Button variant="danger" size="sm" onClick={onClick} aria-label={label}>
      <Icon name="trash" className="size-4" />
      {t('profile.remove')}
    </Button>
  )
  return (
    <div className="mt-8">
      <h3 className="mb-3 text-sm font-semibold text-night">{t('profile.photosTitle')}</h3>
      <Rows
        rows={[
          {
            label: t('profile.photo'),
            value: photo
              ? remove(t('profile.photoRemove'), () => userActions.setPhoto(null))
              : t('profile.photoNone'),
          },
          {
            label: t('profile.cover'),
            value: cover
              ? remove(t('profile.coverRemove'), () => userActions.setCover(null))
              : t('profile.coverNone'),
          },
        ]}
      />
      <p className="mt-2 text-xs font-light text-muted">{t('profile.photosNote')}</p>
    </div>
  )
}

// ---------- Conta e acesso ----------

export function Account() {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <section aria-labelledby="profile-access">
        <SectionHeading id="profile-access" title={t('profile.accessTitle')} icon="lock" />
        <div className="mb-6 rounded-2xl bg-coal p-5 text-white">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="shield" className="size-4 text-gold" />
            {t('profile.demoTitle')}
          </p>
          <p className="mt-2 text-sm font-light text-white/80">{t('profile.demoBody')}</p>
        </div>
        <Rows
          rows={[
            { label: t('profile.email'), value: <Soon /> },
            { label: t('profile.google'), value: <Soon /> },
            { label: t('profile.sessions'), value: t('profile.thisDevice') },
          ]}
        />
      </section>

      <div className="space-y-12">
        <Language />
        <Notifications />
        <About />
      </div>
    </div>
  )
}

function Language() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="profile-language">
      <SectionHeading id="profile-language" title={t('profile.language')} icon="globe" />
      <LanguagePicker />
    </section>
  )
}

function Notifications() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="profile-notifications">
      <SectionHeading id="profile-notifications" title={t('profile.notificationsTitle')} icon="bell" />
      <Rows
        rows={[
          { label: t('profile.notifyInstitutions'), value: <Soon /> },
          { label: t('profile.notifyDeadlines'), value: <Soon /> },
          { label: t('profile.notifyTips'), value: <Soon /> },
        ]}
      />
    </section>
  )
}

function About() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="about">
      <SectionHeading id="about" title={t('profile.about')} icon="info" />
      <p className="-mt-2 mb-4 text-sm font-light text-copy">{t('app.tagline')}</p>
      <ServiceStatus />
    </section>
  )
}

// ---------- Instituições ----------

/** The courses being compared, their institutions, and (soon) the applications. */
export function Institutions() {
  const { t } = useTranslation()
  const { compare } = useUser()
  const query = usePrograms()
  const comparing = scorePrograms(query.data ?? []).filter((item) => compare.includes(item.program.id))
  const institutions = [
    ...new Map(comparing.map((item) => [item.program.institution.id, item.program.institution])).values(),
  ]

  return (
    <div className="space-y-12">
      <section aria-labelledby="profile-comparing">
        <SectionHeading
          id="profile-comparing"
          title={t('profile.comparingTitle')}
          icon="cap"
          action={
            comparing.length > 0 && (
              <ButtonLink to="/cursos/comparar" variant="secondary" size="sm">
                {t('profile.comparingSee')}
              </ButtonLink>
            )
          }
        />
        {compare.length > 0 && query.isPending ? (
          <Loading>
            <CardsSkeleton count={compare.length} className="md:grid-cols-3" />
          </Loading>
        ) : query.isError ? (
          <ErrorState compact onRetry={() => void query.refetch()} />
        ) : comparing.length === 0 ? (
          <div className="rounded-2xl bg-ash-100 p-5">
            <p className="text-sm font-light text-copy">{t('profile.comparingNone')}</p>
            <ButtonLink to="/cursos" variant="secondary" size="sm" className="mt-4">
              {t('profile.coursesGo')}
            </ButtonLink>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {comparing.map((item) => (
              <li key={item.program.id}>
                <ProgramCard item={item} to={`/cursos/${item.program.id}`} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <section aria-labelledby="profile-institutions">
          <SectionHeading id="profile-institutions" title={t('profile.institutionsTitle')} icon="landmark" />
          {institutions.length === 0 ? (
            <p className="text-sm font-light text-muted">{t('profile.institutionsNone')}</p>
          ) : (
            <ul className="space-y-3">
              {institutions.map((institution) => (
                <li key={institution.id}>
                  <InstitutionItem institution={institution} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="profile-applications">
          <SectionHeading
            id="profile-applications"
            title={t('profile.applicationsTitle')}
            icon="briefcase"
            action={<Soon />}
          />
          <p className="max-w-prose text-sm font-light text-copy">{t('profile.applicationsBody')}</p>
        </section>
      </div>
    </div>
  )
}

function InstitutionItem({ institution }: { institution: Institution }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line p-3">
      <InstitutionLogo institution={institution} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-snug font-semibold text-night">{institution.name}</span>
        <span className="mt-1 block text-xs font-light text-muted">
          {t(`training.type_${institution.type}`)} · {t(`training.ownership_${institution.ownership}`)} ·{' '}
          {institution.province}
        </span>
      </span>
    </div>
  )
}

// ---------- Documentos ----------

const DOCUMENTS = ['certificado', 'notas', 'identificacao', 'formacoes', 'recomendacao'] as const

/** The CV, and the school documents that will be uploaded once there is a secure account. */
export function Documents() {
  const { t } = useTranslation()
  const complete = bestCvCompleteness(useUser().cvs)

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <section aria-labelledby="profile-cv">
        <SectionHeading id="profile-cv" title={t('profile.cvTitle')} icon="pencil" />
        <div className="rounded-2xl bg-coal p-5 text-white">
          <p className="font-display text-4xl font-extrabold">{Math.round(complete * 100)}%</p>
          <p className="mt-1 text-sm font-light text-white/80">{t('profile.cvBody')}</p>
          <ProgressBar
            value={complete}
            label={t('profile.cvTitle')}
            tone="gold"
            track="bg-white/15"
            className="mt-4"
          />
          <ButtonLink to="/cv" variant="onDark" size="sm" className="mt-5">
            {t('profile.cvOpen')}
            <Icon name="arrowRight" className="size-4" />
          </ButtonLink>
        </div>
      </section>

      <section aria-labelledby="profile-documents">
        <SectionHeading
          id="profile-documents"
          title={t('profile.docsTitle')}
          icon="document"
          action={<Soon />}
        />
        <Card tone="notice" className="mb-6 flex items-start gap-3 p-5">
          <Icon name="lock" className="mt-0.5 size-4 shrink-0 text-blue" />
          <p className="text-sm font-light text-copy">{t('profile.docsSecure')}</p>
        </Card>
        <ul className="space-y-3">
          {DOCUMENTS.map((id) => (
            <li key={id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ash-100 text-night">
                <Icon name="document" className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-night">{t(`profile.doc_${id}`)}</span>
                <span className="mt-1 block text-xs font-light text-muted">{t(`profile.doc_${id}Hint`)}</span>
              </span>
              <Chip>{t('profile.docsPending')}</Chip>
              <Button variant="secondary" size="sm" disabled>
                <Icon name="plus" className="size-4" />
                {t('profile.docsUpload')}
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

// ---------- Privacidade ----------

/** The rights from Lei n.º 22/11 (a copy of the data, and deleting it), and the texts behind them. */
export function Privacy() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="data" className="max-w-3xl">
      <SectionHeading id="data" title={t('profile.data')} icon="shield" />
      <p className="-mt-2 mb-2 max-w-prose text-sm font-light text-copy">{t('profile.privacyRights')}</p>
      <p className="mb-6 max-w-prose text-sm font-light text-muted">{t('profile.dataBody')}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line p-5">
          <p className="text-sm font-semibold text-night">{t('profile.exportTitle')}</p>
          <p className="mt-1 mb-4 text-xs font-light text-muted">{t('profile.exportBody')}</p>
          <ExportButton />
        </div>
        <div className="rounded-2xl border border-line p-5">
          <p className="text-sm font-semibold text-night">{t('profile.eraseHeading')}</p>
          <p className="mt-1 mb-4 text-xs font-light text-muted">{t('profile.eraseShort')}</p>
          <EraseButton />
        </div>
      </div>
      <h3 className="mt-8 mb-3 text-sm font-semibold text-night">{t('settings.legalTitle')}</h3>
      <LegalLinks className="overflow-hidden rounded-2xl border border-line" />
    </section>
  )
}
