import { useRef, useState, type JSX, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '../../components/icons'
import { ImageCropper } from '../../components/ImageCropper'
import { StatPills } from '../../components/ListHero'
import { ButtonLink } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { TabPanel, Tabs } from '../../components/ui/Tabs'
import { achievements, totalXp } from '../../domain/achievements'
import { cvCompleteness } from '../../domain/cv'
import { ageIn, isMinor } from '../../domain/education'
import { checkImage } from '../../lib/encodeImage'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { userActions, useUser } from '../../state/userStore'
import { Account, Documents, History, Institutions, Overview, PersonalData, Privacy } from './ProfileSections'

const TABS = [
  { id: 'resumo', icon: 'home' },
  { id: 'percurso', icon: 'path' },
  { id: 'dados', icon: 'user' },
  { id: 'conta', icon: 'lock' },
  { id: 'instituicoes', icon: 'landmark' },
  { id: 'documentos', icon: 'document' },
  { id: 'privacidade', icon: 'shield' },
] as const satisfies readonly { id: string; icon: IconName }[]

type TabId = (typeof TABS)[number]['id']

/** Without a profile there is nothing personal to show: only the language, the service and the data rights. */
const GUEST_TABS: ReadonlySet<TabId> = new Set(['conta', 'privacidade'])

const PANELS: Record<TabId, () => JSX.Element | null> = {
  resumo: Overview,
  percurso: History,
  dados: PersonalData,
  conta: Account,
  instituicoes: Institutions,
  documentos: Documents,
  privacidade: Privacy,
}

/**
 * The person's hub: who they are and how far they have come (the hero), then one section at a
 * time in tabs (in the URL, ?secao=): summary, history, personal data, account and access,
 * institutions, documents and privacy. What has no data yet says so and when it comes.
 */
export default function ProfilePage() {
  const { t } = useTranslation()
  const { profile } = useUser()
  const [params, setParam] = useUrlFilters()
  const tabs = TABS.filter((tab) => profile || GUEST_TABS.has(tab.id)).map((tab) => ({
    id: tab.id,
    icon: tab.icon,
    label: t(`profile.tab_${tab.id}`),
  }))
  const active = tabs.find((tab) => tab.id === params.get('secao')) ?? tabs[0]
  const Panel = active ? PANELS[active.id] : null

  return (
    <div className="space-y-4">
      <Hero />
      <div className="sticky top-[var(--topbar-space,0px)] z-10 rounded-card bg-surface p-2 shadow-card transition-[top] duration-300">
        <Tabs
          label={t('profile.tabsLabel')}
          tabs={tabs}
          value={active?.id ?? 'conta'}
          onChange={(id) => setParam('secao', id === tabs[0]?.id ? null : id)}
          idPrefix="profile"
        />
      </div>
      {active && Panel && (
        <TabPanel key={active.id} idPrefix="profile" id={active.id} className="mt-1">
          <Panel />
        </TabPanel>
      )}
    </div>
  )
}

/**
 * Who the person is on white: a cover photo, the profile photo on its lower edge, the name, the numbers.
 * How far along the path they are beside it: black, with what is done in the main blue.
 */
function Hero() {
  const { t } = useTranslation()
  const user = useUser()
  const person = user.profile
  const [error, setError] = useState<string | null>(null)
  const [cropping, setCropping] = useState<{ kind: 'photo' | 'cover'; file: File } | null>(null)

  if (!person) {
    return (
      <section aria-labelledby="profile-title" className="rounded-card bg-surface p-6 shadow-card sm:p-8">
        <h1 id="profile-title" className="text-sm font-semibold text-muted">
          {t('profile.title')}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-5">
          <span className="grid size-20 shrink-0 place-items-center rounded-full bg-ash-100 text-muted">
            <Icon name="user" className="size-8" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-2xl leading-tight font-extrabold text-night sm:text-3xl">
              {t('profile.guest')}
            </p>
            <p className="mt-2 max-w-prose text-sm font-light text-copy">{t('profile.guestBody')}</p>
          </div>
          <ButtonLink to="/entrar" size="lg">
            {t('profile.create')}
          </ButtonLink>
        </div>
      </section>
    )
  }

  const xp = totalXp(achievements(user))
  const cv = Math.round(cvCompleteness(user.cv) * 100)
  // A picked picture is checked, then placed in the cropper before anything is saved.
  const pick = (file: File, kind: 'photo' | 'cover') => {
    const check = checkImage(file)
    setError(check === 'ok' ? null : t(check === 'type' ? 'profile.photoError' : 'profile.photoTooBig'))
    if (check === 'ok') setCropping({ kind, file })
  }
  const done = (image: string) => {
    if (cropping?.kind === 'photo') userActions.setPhoto(image)
    else userActions.setCover(image)
    setCropping(null)
  }
  const stats = [
    { icon: 'award', value: xp, label: t('profile.statXp') },
    { icon: 'bookmark', value: user.savedCareers.length, label: t('profile.statSaved') },
    { icon: 'check', value: Object.keys(user.skills).length, label: t('profile.statSkills') },
    { icon: 'document', value: `${cv}%`, label: t('profile.statCv') },
  ] satisfies { icon: IconName; value: string | number; label: string }[]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <section
        aria-labelledby="profile-title"
        className="overflow-hidden rounded-card bg-surface shadow-card"
      >
        <div className="relative h-32 bg-ash-200 sm:h-40">
          {user.cover && <img src={user.cover} alt="" className="size-full object-cover" />}
          <ImagePicker
            name="cover"
            label={user.cover ? t('profile.coverChange') : t('profile.coverAdd')}
            onPick={(file) => pick(file, 'cover')}
            className="absolute top-3 right-3 inline-flex h-9 items-center gap-2 rounded-full bg-surface px-4 text-sm font-normal text-night shadow-card hover:bg-ash-100"
          >
            <Icon name="camera" className="size-4" />
            {user.cover ? t('profile.coverChange') : t('profile.coverAdd')}
          </ImagePicker>
        </div>

        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
            {/* The avatar's middle sits on the cover's lower edge. */}
            <div className="relative -mt-12 shrink-0">
              <span
                aria-hidden="true"
                className="grid size-24 place-items-center overflow-hidden rounded-full bg-coal font-display text-4xl font-extrabold text-gold ring-4 ring-surface"
              >
                {user.photo ? (
                  <img src={user.photo} alt="" className="size-full object-cover" />
                ) : (
                  person.name.charAt(0).toUpperCase()
                )}
              </span>
              <ImagePicker
                name="photo"
                label={t('profile.photoChange')}
                onPick={(file) => pick(file, 'photo')}
                className="absolute right-0 bottom-0 grid size-9 place-items-center rounded-full border border-line bg-surface text-night shadow-card hover:bg-ash-100"
              >
                <Icon name="camera" className="size-4" />
              </ImagePicker>
            </div>
            <div className="min-w-0 pt-2">
              <h1 id="profile-title" className="text-sm font-semibold text-muted">
                {t('profile.title')}
              </h1>
              <p className="mt-1 text-3xl leading-tight font-extrabold text-night sm:text-4xl">
                {person.name}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm font-light text-copy">
            {t('profile.age', { age: ageIn(person.birthYear) })} · {person.province} ·{' '}
            {t(`education.${person.education}`)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {isMinor(person.birthYear) && (
              <Chip tone="night">
                <Icon name="lock" className="size-3" />
                {t('profile.minor')}
              </Chip>
            )}
            <Chip>
              <Icon name="shield" className="size-3" />
              {t('profile.onDevice')}
            </Chip>
          </div>
          {error && (
            <p role="alert" className="mt-4 text-sm font-normal text-coral">
              {error}
            </p>
          )}
          <StatPills stats={stats} />
        </div>
      </section>
      <PathCard />
      {/* Small enough for the device's storage: a 320 px square photo, a 1500 × 500 cover. */}
      <ImageCropper
        file={cropping?.file ?? null}
        title={cropping?.kind === 'cover' ? t('profile.cropCover') : t('profile.cropPhoto')}
        output={cropping?.kind === 'cover' ? { width: 1500, height: 500 } : { width: 320, height: 320 }}
        round={cropping?.kind === 'photo'}
        onCancel={() => setCropping(null)}
        onDone={done}
      />
    </div>
  )
}

type ImagePickerProps = {
  name: 'photo' | 'cover'
  label: string
  onPick: (file: File) => void
  className: string
  children: ReactNode
}

/** A button that opens the device's photo picker; the file input itself stays out of sight. */
function ImagePicker({ name, label, onPick, className, children }: ImagePickerProps) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <button type="button" aria-label={label} onClick={() => input.current?.click()} className={className}>
        {children}
      </button>
      <input
        ref={input}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onPick(file)
          event.target.value = ''
        }}
      />
    </>
  )
}

/** The six steps of the path, the share done, and a button to the next one. */
function PathCard() {
  const { t } = useTranslation()
  const user = useUser()
  const steps = [
    { id: 'perfil', done: user.profile !== null, to: '/entrar' },
    { id: 'teste', done: user.assessmentCompletedAt !== null, to: '/teste' },
    { id: 'destino', done: user.targetCareer !== null, to: '/carreiras' },
    {
      id: 'competencias',
      done: Object.keys(user.skills).length > 0,
      to: user.targetCareer ? `/carreiras/${user.targetCareer}` : '/carreiras',
    },
    { id: 'cv', done: cvCompleteness(user.cv) === 1, to: '/cv' },
    { id: 'cursos', done: user.compare.length > 0, to: '/cursos' },
  ] as const
  const done = steps.filter((step) => step.done).length
  const next = steps.find((step) => !step.done)

  return (
    <section aria-labelledby="path-title" className="rounded-card bg-coal p-6 text-white shadow-card sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="path-title" className="text-xl font-extrabold">
          {t('profile.pathTitle')}
        </h2>
        <span className="text-sm font-semibold tabular-nums">
          {t('profile.pathCount', { done, total: steps.length })}
        </span>
      </div>
      <ProgressBar
        value={done / steps.length}
        label={t('profile.pathTitle')}
        tone="white"
        track="bg-white/15"
        className="mt-4"
      />
      <ol className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center gap-3 text-sm">
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                step.done ? 'bg-blue text-white' : 'border border-white/40 text-white'
              }`}
            >
              {step.done ? <Icon name="check" className="size-3.5" /> : index + 1}
            </span>
            <span className={step.done ? 'font-light text-white' : 'font-normal text-white'}>
              {t(`profile.step_${step.id}`)}
              <span className="sr-only"> · {step.done ? t('profile.stepDone') : t('profile.stepTodo')}</span>
            </span>
          </li>
        ))}
      </ol>
      {next ? (
        <div className="mt-6">
          <p className="text-xs font-light text-white/80">{t('profile.next')}</p>
          <ButtonLink to={next.to} variant="onDark" size="sm" className="mt-2">
            {t(`profile.step_${next.id}`)}
            <Icon name="arrowRight" className="size-4" />
          </ButtonLink>
        </div>
      ) : (
        <p className="mt-6 text-sm font-light text-white/80">{t('profile.pathDone')}</p>
      )}
    </section>
  )
}
