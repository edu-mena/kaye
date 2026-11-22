import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { DemandMeter } from '../../components/DemandMeter'
import { GROUP_ICONS } from '../../components/groupIcons'
import { Icon } from '../../components/icons'
import { PhotoImg } from '../../components/PhotoImg'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { CheckboxField, SelectField, TextField } from '../../components/ui/Field'
import { ACCOUNTS } from '../../data/account'
import { PROVINCES } from '../../data/provinces'
import { contactProblems } from '../../data/waitlist'
import { RIASEC_KEYS, type CareerSummary, type MarketArea, type RiasecKey } from '../../data/types'
import {
  MAX_AREAS,
  MAX_GROUPS,
  MAX_INTERESTS,
  REACTIONS,
  SITUATIONS,
  areaCounts,
  areasFor,
  groupsOf,
  pickCareer,
  type AreaAnswers,
  type Reaction,
} from '../../domain/discovery'
import { VOICES } from '../../lib/voices'
import { LanguagePicker } from '../settings/SettingsParts'
import { AREA_ICONS, GOAL_ICONS, INTEREST_ICONS, SITUATION_ICONS } from '../../components/areaIcons'
import {
  BIRTH_YEARS,
  CURRENT_YEAR,
  areaAnswers,
  educationOptions,
  goalOptions,
  levelOptions,
  needsGuardian,
  type Draft,
  type Step,
} from './flow'
import { Guide } from './Guide'
import { LevelBars, OptionGrid } from './OptionCard'
import { BuildingScene, GoogleMark, StatsScene } from './scenes'

const UNSURE = 'unsure'
const BUILDING_MS = 3600
const SIGN_IN_MS = 900
const FLY_MS = 300
const FLY: Record<Reaction, string> = {
  no: 'animate-fly-left',
  maybe: 'animate-fly-up',
  yes: 'animate-fly-right',
}
const LEGAL_LINK = 'font-normal text-night underline underline-offset-2 hover:text-blue'

const toggled = <T,>(list: readonly T[], item: T, max: number): T[] => {
  if (list.includes(item)) return list.filter((entry) => entry !== item)
  return list.length < max ? [...list, item] : [...list]
}

type Heading = { title: string; hint?: string }

type HeadingProps = Heading & {
  speaking: boolean
  /** Changes with each answer, for the guide to react. */
  hop: string
  centered?: boolean
}

/** The guide and what it is saying. The title takes the focus when the step changes. */
export function StepHeading({ title, hint, speaking, hop, centered = false }: HeadingProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  // Each step mounts its own heading: it starts at the top and a screen reader hears the question.
  useEffect(() => {
    window.scrollTo(0, 0)
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <header className={centered ? 'pt-6 text-center' : 'flex items-center gap-4'}>
      <Guide size={centered ? 'lg' : 'sm'} speaking={speaking} hop={hop} />
      <div className={centered ? 'mt-6' : 'min-w-0'}>
        <h1
          ref={titleRef}
          tabIndex={-1}
          className="text-2xl leading-tight font-extrabold text-night focus:outline-none sm:text-3xl"
        >
          {title}
        </h1>
        {hint && <p className="mt-2 text-sm font-light text-copy">{hint}</p>}
      </div>
    </header>
  )
}

/** The bottom of the screen, always within reach of the thumb. */
export function StepFooter({ children }: { children: React.ReactNode }) {
  return (
    <footer className="sticky bottom-0 z-10 mt-auto bg-surface px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-2xl">{children}</div>
    </footer>
  )
}

type StepProps = {
  step: Step
  draft: Draft
  change: (patch: Partial<Draft>) => void
  careers: CareerSummary[]
  next: () => void
  heading: Heading
  speaking: boolean
  voice: string | null
  onFinish: () => void
}

/** Changes with every answer, not with every letter typed. */
const answersKey = ({ situation, goal, areas, interests, answers, education }: Draft) =>
  JSON.stringify([situation, goal, areas, interests, answers, education])

export function StepScreen(props: StepProps) {
  const { step, draft, heading, speaking } = props
  switch (step.id) {
    case 'welcome':
      return <WelcomeStep {...props} />
    case 'stats':
      return (
        <>
          <StepHeading {...heading} speaking={speaking} hop="stats" />
          <StatsScene careers={props.careers} />
        </>
      )
    case 'building':
      return <BuildingStep {...props} />
    case 'signup':
      return <SignupStep {...props} />
    case 'areaCareer':
      return <CareerStep {...props} area={step.area} />
    default:
      return (
        <>
          <StepHeading {...heading} speaking={speaking} hop={answersKey(draft)} />
          <div className="mt-8">
            <QuestionBody {...props} />
          </div>
        </>
      )
  }
}

function WelcomeStep({ heading, speaking }: StepProps) {
  return (
    <>
      <StepHeading {...heading} speaking={speaking} hop="welcome" centered />
      <div className="mx-auto mt-10 max-w-sm">
        <LanguagePicker />
      </div>
    </>
  )
}

function QuestionBody({ step, draft, change, careers, voice }: StepProps) {
  const { t } = useTranslation()

  const updateArea = (area: MarketArea, patch: Partial<AreaAnswers>) =>
    change({ answers: { ...draft.answers, [area]: { ...areaAnswers(draft, area), ...patch } } })

  switch (step.id) {
    case 'contact': {
      const problems = contactProblems(draft.email, draft.whatsapp)
      // Errors only once the person has typed enough for them to be fair.
      const badEmail = problems.email && draft.email.includes('@')
      const badPhone = problems.whatsapp && draft.whatsapp.replace(/\D/g, '').length >= 9
      return (
        <div className="space-y-5">
          <TextField
            label={t('onboarding.contactEmail')}
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={120}
            value={draft.email}
            error={badEmail ? t('prelaunch.waitlistBadEmail') : null}
            onChange={(event) => change({ email: event.target.value })}
          />
          <TextField
            label={t('onboarding.contactWhatsapp')}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+244 9XX XXX XXX"
            maxLength={30}
            value={draft.whatsapp}
            error={badPhone ? t('prelaunch.waitlistBadPhone') : null}
            onChange={(event) => change({ whatsapp: event.target.value })}
          />
          <p className="text-sm font-light text-muted">{t('prelaunch.waitlistOneOf')}</p>
          <CheckboxField
            label={t('onboarding.contactConsent')}
            checked={draft.contactConsent}
            onChange={(event) => change({ contactConsent: event.target.checked })}
          />
        </div>
      )
    }
    case 'voice':
      return <VoiceChoice draft={draft} change={change} voice={voice} />
    case 'situation':
      return (
        <OptionGrid
          label={t('onboarding.situationTitle')}
          options={SITUATIONS.map((value) => ({
            value,
            label: t(`onboarding.situation_${value}`),
            icon: SITUATION_ICONS[value],
          }))}
          selected={draft.situation ? [draft.situation] : []}
          onToggle={(situation) => change({ situation })}
        />
      )
    case 'goal':
      return (
        <OptionGrid
          label={t('onboarding.goalTitle')}
          options={goalOptions(draft.situation).map((value) => ({
            value,
            label: t(`onboarding.goal_${value}`),
            icon: GOAL_ICONS[value],
          }))}
          selected={draft.goal ? [draft.goal] : []}
          onToggle={(goal) => change({ goal })}
        />
      )
    case 'areas':
      return (
        <OptionGrid<MarketArea | typeof UNSURE>
          label={t('onboarding.areasTitle')}
          options={[
            ...areaCounts(careers).map(({ area, count }) => ({
              value: area,
              label: t(`market.area_${area}`),
              body: t('onboarding.careerCount', { count }),
              icon: AREA_ICONS[area],
            })),
            { value: UNSURE, label: t('onboarding.unsure'), icon: 'compass' },
          ]}
          selected={draft.unsure ? [UNSURE] : draft.areas}
          full={!draft.unsure && draft.areas.length >= MAX_AREAS}
          onToggle={(value) =>
            value === UNSURE
              ? change({ unsure: !draft.unsure, areas: [], interests: [] })
              : change({ unsure: false, interests: [], areas: toggled(draft.areas, value, MAX_AREAS) })
          }
        />
      )
    case 'interests':
      return (
        <>
          <OptionGrid<RiasecKey>
            label={t('onboarding.interestsTitle')}
            options={RIASEC_KEYS.map((value) => ({
              value,
              label: t(`onboarding.interest_${value}`),
              icon: INTEREST_ICONS[value],
            }))}
            selected={draft.interests}
            full={draft.interests.length >= MAX_INTERESTS}
            onToggle={(value) => {
              const interests = toggled(draft.interests, value, MAX_INTERESTS)
              change({ interests, areas: areasFor(interests, careers) })
            }}
          />
          {draft.areas.length > 0 && (
            <output className="mt-6 block rise">
              <span className="text-sm font-normal text-night">{t('onboarding.interestsAreas')}</span>
              <span className="mt-2 flex flex-wrap gap-2">
                {draft.areas.map((area) => (
                  <Chip key={area}>{t(`market.area_${area}`)}</Chip>
                ))}
              </span>
            </output>
          )}
        </>
      )
    case 'areaGroups': {
      const selected = areaAnswers(draft, step.area).groups
      return (
        <OptionGrid
          label={t('onboarding.areaGroupsHint')}
          options={groupsOf(careers, step.area).map((group) => ({
            value: group,
            label: t(`groups.${group}`),
            body: t('onboarding.careerCount', {
              count: careers.filter((career) => career.group === group).length,
            }),
            icon: GROUP_ICONS[group],
          }))}
          selected={selected}
          full={selected.length >= MAX_GROUPS}
          onToggle={(group) =>
            updateArea(step.area, { groups: toggled(selected, group, MAX_GROUPS), reaction: null })
          }
        />
      )
    }
    case 'areaLevel': {
      const { level } = areaAnswers(draft, step.area)
      return (
        <OptionGrid
          label={t('onboarding.areaLevelHint')}
          options={levelOptions(draft.situation).map((value, index) => ({
            value,
            label: t(`onboarding.level_${value}`),
            art: <LevelBars level={index + 1} total={4} />,
          }))}
          selected={level ? [level] : []}
          onToggle={(value) => updateArea(step.area, { level: value })}
        />
      )
    }
    case 'name':
      return (
        <TextField
          label={t('onboarding.name')}
          placeholder={t('onboarding.namePlaceholder')}
          autoComplete="given-name"
          maxLength={40}
          value={draft.name}
          onChange={(event) => change({ name: event.target.value })}
        />
      )
    case 'about':
      return (
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label={t('onboarding.birthYear')}
            placeholder={t('common.select')}
            options={BIRTH_YEARS.map((value) => ({ value, label: value }))}
            value={draft.birthYear}
            onChange={(event) => change({ birthYear: event.target.value })}
          />
          <SelectField
            label={t('onboarding.province')}
            placeholder={t('common.select')}
            options={PROVINCES.map((value) => ({ value, label: value }))}
            value={draft.province}
            onChange={(event) => change({ province: event.target.value })}
          />
        </div>
      )
    case 'education': {
      const options = educationOptions(draft.situation)
      return (
        <OptionGrid
          label={t('onboarding.education')}
          options={options.map((value, index) => ({
            value,
            label: t(`education.${value}`),
            art: <LevelBars level={index + 1} total={options.length} />,
          }))}
          selected={draft.education ? [draft.education] : []}
          onToggle={(education) => change({ education })}
        />
      )
    }
    default:
      return null
  }
}

function VoiceChoice({ draft, change, voice }: Pick<StepProps, 'draft' | 'change' | 'voice'>) {
  const { t, i18n } = useTranslation()

  return (
    <>
      <OptionGrid
        label={t('onboarding.voiceTitle')}
        options={(VOICES[i18n.language] ?? []).map((item) => ({
          value: item.id,
          label: item.name,
          body: t(`onboarding.accent_${item.accent}`),
          art: <Guide size="md" hop={item.id} />,
        }))}
        selected={draft.voiceOn && voice ? [voice] : []}
        onToggle={(id) => change({ voice: id, voiceOn: true })}
      />
      <label className="mt-8 flex items-center justify-center gap-3 text-sm font-normal text-night">
        {t('onboarding.voiceToggle')}
        <input
          type="checkbox"
          checked={draft.voiceOn}
          onChange={(event) => change({ voiceOn: event.target.checked })}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-7 w-12 rounded-full bg-ash-300 transition-colors peer-checked:bg-blue peer-focus-visible:outline-3 peer-focus-visible:outline-gold after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
        />
      </label>
    </>
  )
}

/** Yes, maybe or no to a real career from what the person chose; the card flies off with the answer. */
function CareerStep({
  draft,
  change,
  careers,
  next,
  heading,
  speaking,
  area,
}: StepProps & { area: MarketArea }) {
  const { t } = useTranslation()
  const answers = areaAnswers(draft, area)
  const career = pickCareer(careers, area, answers.groups)
  const [leaving, setLeaving] = useState<Reaction | null>(null)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  if (!career) return null

  const answer = (reaction: Reaction) => {
    setLeaving(reaction)
    timer.current = window.setTimeout(() => {
      change({
        answers: { ...draft.answers, [area]: { ...answers, career: career.slug, reaction } },
      })
      next()
    }, FLY_MS)
  }

  return (
    <>
      <StepHeading {...heading} speaking={speaking} hop={career.slug} />
      <article
        className={`mx-auto mt-6 max-w-sm overflow-hidden rounded-card bg-surface shadow-lift ${leaving ? FLY[leaving] : 'rise'}`}
      >
        <div className="relative h-44 bg-coal">
          {career.image && (
            <PhotoImg
              photo={career.image}
              sizes="24rem"
              className="size-full object-cover object-[center_30%]"
            />
          )}
          <span className="absolute bottom-3 left-3 grid size-10 place-items-center rounded-full bg-coal text-gold">
            <Icon name={GROUP_ICONS[career.group]} className="size-5" />
          </span>
        </div>
        <div className="p-5">
          <h2 className="text-lg leading-snug font-semibold text-night">{career.name}</h2>
          <p className="mt-1 text-xs font-light text-muted">{t(`groups.${career.group}`)}</p>
          <p className="mt-3 line-clamp-3 text-sm font-light text-copy">{career.summary}</p>
          <div className="mt-4 border-t border-line pt-3">
            <DemandMeter demand={career.demand} />
          </div>
        </div>
      </article>
      <div className="sticky bottom-0 mt-6 bg-surface py-3">
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-2">
          {REACTIONS.map((reaction) => (
            <Button
              key={reaction}
              variant="secondary"
              size="lg"
              aria-pressed={answers.career === career.slug && answers.reaction === reaction}
              disabled={leaving !== null}
              onClick={() => answer(reaction)}
              className="aria-pressed:border-night aria-pressed:bg-night aria-pressed:text-white"
            >
              {t(`onboarding.reaction_${reaction}`)}
            </Button>
          ))}
        </div>
      </div>
    </>
  )
}

function BuildingStep({ next, heading, speaking }: StepProps) {
  const { t } = useTranslation()

  useEffect(() => {
    const timer = window.setTimeout(next, BUILDING_MS)
    return () => window.clearTimeout(timer)
  }, [next])

  return (
    <>
      <StepHeading {...heading} speaking={speaking} hop="building" />
      <BuildingScene
        lines={[t('onboarding.building1'), t('onboarding.building2'), t('onboarding.building3')]}
      />
    </>
  )
}

/**
 * The sign-in closes the conversation (docs/decisoes/0012). With accounts, the profile is kept on the device and
 * the browser goes to Google; back in the app, the device's data joins the account (state/accountSync.ts).
 * Without them (the demo site), it is simulated.
 */
function SignupStep({ draft, change, heading, speaking, onFinish }: StepProps) {
  const { t } = useTranslation()
  const minor = needsGuardian(draft, CURRENT_YEAR)
  const [tried, setTried] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const required = t('onboarding.required')

  function signIn() {
    setTried(true)
    if (!draft.terms || (minor && !draft.guardian)) return
    setSigningIn(true)
    // With accounts, finishing goes to Google's login (OnboardingPage).
    if (ACCOUNTS) return onFinish()
    window.setTimeout(onFinish, SIGN_IN_MS)
  }

  return (
    <>
      <StepHeading {...heading} speaking={speaking} hop="signup" />
      <div className="mx-auto mt-8 max-w-md space-y-5">
        {minor && (
          <Card tone="notice" className="space-y-3">
            <p className="text-base font-semibold">{t('onboarding.minorTitle')}</p>
            <p className="text-sm font-light text-copy">{t('onboarding.minorBody')}</p>
            <CheckboxField
              label={t('onboarding.guardian')}
              checked={draft.guardian}
              error={tried && !draft.guardian ? required : null}
              onChange={(event) => change({ guardian: event.target.checked })}
            />
          </Card>
        )}
        <div>
          <CheckboxField
            label={t('onboarding.terms')}
            checked={draft.terms}
            error={tried && !draft.terms ? required : null}
            onChange={(event) => change({ terms: event.target.checked })}
          />
          {/* Outside the label, so the links do not become part of the checkbox's name. A new
              tab keeps what was already filled in here. */}
          <p className="mt-1 pl-8 text-xs font-light text-muted">
            {t('onboarding.termsRead')}{' '}
            <Link to="/termos" target="_blank" className={LEGAL_LINK}>
              {t('legal.terms')}
            </Link>
            {' · '}
            <Link to="/privacidade" target="_blank" className={LEGAL_LINK}>
              {t('legal.privacy')}
            </Link>
          </p>
        </div>
        <Button variant="secondary" size="lg" className="w-full" disabled={signingIn} onClick={signIn}>
          {signingIn ? (
            <span className="size-5 animate-spin rounded-full border-2 border-line border-t-blue" />
          ) : (
            <GoogleMark />
          )}
          {signingIn ? t('onboarding.signingIn') : t('onboarding.google')}
        </Button>
        {!ACCOUNTS && (
          <p className="text-center text-xs font-light text-muted">{t('onboarding.googleSoon')}</p>
        )}
      </div>
    </>
  )
}
