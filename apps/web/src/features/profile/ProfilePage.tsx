import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { CareerCard } from '../../components/CareerCard'
import { Icon } from '../../components/icons'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { Dialog } from '../../components/ui/Dialog'
import { Hexagon } from '../../components/ui/Hexagon'
import { PageHeader, SectionHeading } from '../../components/ui/PageHeader'
import { useCareers } from '../../data/queries'
import { achievements, totalXp } from '../../domain/achievements'
import { ageIn, isMinor } from '../../domain/education'
import { riasecCode } from '../../domain/riasec'
import { changeLocale, LOCALE_NAMES, LOCALES } from '../../lib/i18n'
import { useApiHealth } from '../../lib/useApiHealth'
import { useRiasecProfile } from '../../state/useRiasecProfile'
import { getUser, userActions, useUser } from '../../state/userStore'
import { saveFile } from '../../lib/saveFile'

export default function ProfilePage() {
  const { t } = useTranslation()
  const user = useUser()
  const list = achievements(user)

  return (
    <div className="space-y-10">
      <PageHeader title={t('profile.title')} />
      <PersonCard />

      <section aria-labelledby="achievements">
        <SectionHeading
          id="achievements"
          title={t('profile.achievements')}
          icon="award"
          action={
            <span className="text-sm font-semibold text-gold-ink">
              {t('common.xp', { xp: totalXp(list) })}
            </span>
          }
        />
        <p className="-mt-2 mb-6 text-sm font-light text-copy">{t('profile.achievementsBody')}</p>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {list.map((achievement) => (
            <li
              key={achievement.id}
              className="flex flex-col items-center rounded-card bg-surface p-6 text-center shadow-card"
            >
              <Hexagon tone={achievement.earned ? 'gold' : 'locked'}>
                {achievement.earned ? (
                  <Icon name="check" className="size-7" />
                ) : (
                  <Icon name="lock" className="size-6" />
                )}
              </Hexagon>
              <p className="mt-4 text-sm font-semibold text-night">{t(`achievement.${achievement.id}`)}</p>
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

      <SavedCareers />
      <Language />
      <YourData />
      <About />
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line py-3 first:border-t-0">
      <span className="text-sm font-light text-muted">{label}</span>
      <span className="text-right text-sm font-semibold text-night">{children}</span>
    </div>
  )
}

function PersonCard() {
  const { t } = useTranslation()
  const user = useUser()
  const { profile, completed } = useRiasecProfile()
  const skills = Object.keys(user.skills).length

  if (!user.profile) {
    return (
      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <p className="text-sm font-light text-copy">{t('profile.guest')}</p>
        <ButtonLink to="/entrar">{t('profile.create')}</ButtonLink>
      </Card>
    )
  }

  const person = user.profile
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full bg-coal font-display text-2xl font-bold text-white">
          {person.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="text-lg font-semibold text-night">{person.name}</p>
          <p className="mt-1 text-xs font-light text-muted">
            {t('profile.age', { age: ageIn(person.birthYear) })} · {person.province}
          </p>
        </div>
        {isMinor(person.birthYear) && (
          <Chip className="ml-auto">
            <Icon name="lock" className="size-3" />
            {t('profile.minor')}
          </Chip>
        )}
      </div>
      <Row label={t('onboarding.education')}>{t(`education.${person.education}`)}</Row>
      <Row label={t('profile.test')}>
        {completed && profile ? (
          <Link
            to="/teste/resultado"
            className="text-sm font-normal text-blue underline-offset-4 hover:underline"
          >
            {riasecCode(profile)}
          </Link>
        ) : (
          <Link to="/teste" className="text-sm font-normal text-blue underline-offset-4 hover:underline">
            {t('profile.testNone')}
          </Link>
        )}
      </Row>
      <Row label={t('profile.skills')}>
        {skills > 0 ? t('profile.skillsCount', { count: skills }) : t('profile.skillsNone')}
      </Row>
    </Card>
  )
}

function SavedCareers() {
  const { t } = useTranslation()
  const { savedCareers } = useUser()
  const { data: careers = [] } = useCareers()
  const saved = careers.filter((career) => savedCareers.includes(career.slug))

  return (
    <section aria-labelledby="saved">
      <SectionHeading id="saved" title={t('profile.saved')} icon="bookmark" />
      {saved.length === 0 ? (
        <p className="text-sm font-light text-muted">{t('profile.savedNone')}</p>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {saved.map((career) => (
            <li key={career.slug}>
              <CareerCard career={career} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Language() {
  const { t, i18n } = useTranslation()
  return (
    <fieldset>
      <legend className="mb-6 flex items-center gap-3 text-xl font-extrabold text-night sm:text-2xl">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue text-white">
          <Icon name="globe" className="size-5" />
        </span>
        {t('profile.language')}
      </legend>
      <div className="grid grid-cols-3 gap-2">
        {LOCALES.map((locale) => {
          const active = i18n.language === locale
          return (
            <button
              key={locale}
              type="button"
              lang={locale}
              aria-pressed={active}
              onClick={() => changeLocale(locale)}
              className={`rounded-full border px-4 py-3 text-sm transition-colors ${
                active
                  ? 'border-night bg-night font-normal text-white'
                  : 'border-line bg-surface font-light text-night hover:bg-ash-100'
              }`}
            >
              {LOCALE_NAMES[locale]}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

/** A JSON copy of everything the app keeps about the person. */
function downloadMyData() {
  saveFile(
    new Blob([JSON.stringify(getUser(), null, 2)], { type: 'application/json' }),
    'kaye-os-meus-dados.json',
  )
}

/** The rights from Lei n.º 22/11: get a copy of your data and delete it. */
function YourData() {
  const { t } = useTranslation()
  const [confirming, setConfirming] = useState(false)

  return (
    <section aria-labelledby="data">
      <SectionHeading id="data" title={t('profile.data')} icon="shield" />
      <p className="-mt-2 mb-6 text-sm font-light text-copy">{t('profile.dataBody')}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={downloadMyData}>
          <Icon name="download" className="size-4" />
          {t('profile.export')}
        </Button>
        <Button variant="ghost" className="text-coral" onClick={() => setConfirming(true)}>
          <Icon name="trash" className="size-4" />
          {t('profile.erase')}
        </Button>
      </div>
      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={t('profile.eraseTitle')}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-coral hover:bg-coral"
              onClick={() => {
                userActions.eraseAll()
                setConfirming(false)
              }}
            >
              {t('profile.eraseConfirm')}
            </Button>
          </div>
        }
      >
        <p className="text-sm font-light text-copy">{t('profile.eraseBody')}</p>
      </Dialog>
    </section>
  )
}

function About() {
  const { t } = useTranslation()
  const { isPending, isError } = useApiHealth()
  const [label, dot] = isPending
    ? [t('status.checking'), 'bg-track']
    : isError
      ? [t('status.offline'), 'bg-coral']
      : [t('status.online'), 'bg-success']

  return (
    <section aria-labelledby="about">
      <SectionHeading id="about" title={t('profile.about')} icon="info" />
      <p className="-mt-2 mb-4 text-sm font-light text-copy">{t('app.tagline')}</p>
      <output className="flex items-center gap-2 text-sm font-light text-muted">
        <span className={`size-2 rounded-full ${dot}`} />
        {label}
      </output>
    </section>
  )
}
