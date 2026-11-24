import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { Card } from '../../components/ui/Card'
import { useCareerDetails, useCareers } from '../../data/queries'
import { DAILY_XP, DAILY_XP_CORRECT } from '../../domain/achievements'
import {
  dailyCandidates,
  dailyChallenge,
  type DailyChallenge as Challenge,
  type DailyOption,
} from '../../domain/daily'
import { formatKz } from '../../domain/format'
import { todayIso } from '../../domain/scholarships'
import { useInterestAreas } from '../../lib/useInterestAreas'
import { useShowsSalaries } from '../../state/useShowsSalaries'
import { userActions, useUser } from '../../state/userStore'

/** The challenge of today, made from the catalogue, or null while it loads or when the catalogue cannot make one. */
function useChallenge(): Challenge | null {
  const { profile, targetCareer } = useUser()
  const { data: careers } = useCareers()
  const areas = useInterestAreas()
  const showSalaries = useShowsSalaries()
  const date = todayIso()
  const slugs = useMemo(
    () => dailyCandidates({ date, careers: careers ?? [], areas, target: targetCareer }),
    [date, careers, areas, targetCareer],
  )
  // The "time" question needs a few careers in full; waiting for them keeps today's question from changing.
  const details = useCareerDetails(slugs)
  return useMemo(
    () =>
      careers && !details.isPending
        ? dailyChallenge({
            date,
            careers,
            details: details.data,
            areas,
            target: targetCareer,
            education: profile?.education ?? null,
            showSalaries,
          })
        : null,
    [careers, details.isPending, details.data, date, areas, targetCareer, profile?.education, showSalaries],
  )
}

function useOptionLabel() {
  const { t } = useTranslation()
  return (option: DailyOption) => {
    switch (option.kind) {
      case 'kz':
        return formatKz(option.value)
      case 'career':
        return option.name
      case 'months':
        return t('forYou.dailyMonths', { count: option.value })
    }
  }
}

const QUESTION = {
  salary: 'forYou.dailySalary',
  demand: 'forYou.dailyDemand',
  time: 'forYou.dailyTime',
} as const satisfies Record<Challenge['kind'], string>

function contextOf(challenge: Challenge, entry: boolean) {
  if (challenge.kind === 'salary')
    return entry ? 'forYou.dailyContextSalaryEntry' : 'forYou.dailyContextSalary'
  return challenge.kind === 'demand' ? 'forYou.dailyContextDemand' : 'forYou.dailyContextTime'
}

/** One question a day: pick an answer, see the right one, with where the number comes from. */
export function DailyChallenge() {
  const { t } = useTranslation()
  const { daily } = useUser()
  const { data: careers } = useCareers()
  const challenge = useChallenge()
  const label = useOptionLabel()
  if (!challenge) return null

  const answered = daily?.[challenge.date]
  const subjects = challenge.careers.flatMap((slug) => careers?.find((career) => career.slug === slug) ?? [])
  const xp = DAILY_XP + (answered?.correct ? DAILY_XP_CORRECT : 0)
  const rightLabel = label(challenge.options[challenge.answer] as DailyOption)

  return (
    <Card as="section" tone="coal" aria-labelledby="home-daily" className="p-5">
      <p className="text-xs font-light text-white/80">{t('forYou.dailyLabel')}</p>
      <h2 id="home-daily" className="mt-1 text-lg leading-snug font-extrabold">
        {t(QUESTION[challenge.kind], { career: challenge.subject })}
      </h2>
      <fieldset className="m-0 mt-4 grid min-w-0 gap-2 border-0 p-0">
        <legend className="sr-only">{t('forYou.dailyGroup')}</legend>
        {challenge.options.map((option, index) => {
          const picked = answered?.picked === index
          const right = answered !== undefined && index === challenge.answer
          return (
            <label
              key={label(option)}
              className={`flex h-11 items-center justify-between rounded-full px-5 text-sm font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-white has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-coal ${
                right || picked
                  ? 'bg-white text-night'
                  : `border border-white/30 text-white ${answered ? 'opacity-60' : 'cursor-pointer hover:bg-white/10'}`
              }`}
            >
              <input
                type="radio"
                name="daily-challenge"
                className="sr-only"
                checked={picked}
                disabled={answered !== undefined}
                onChange={() => userActions.answerDaily(challenge.date, index, index === challenge.answer)}
              />
              {label(option)}
              {right && <Icon name="check" className="size-4" />}
            </label>
          )
        })}
      </fieldset>
      {answered && (
        <div className="mt-4 space-y-2" aria-live="polite">
          <p className="text-sm font-semibold">
            {answered.correct ? t('forYou.dailyRight') : t('forYou.dailyWrong', { answer: rightLabel })}{' '}
            <span className="font-light text-white/80">{t('forYou.dailyXp', { xp })}</span>
          </p>
          <p className="text-xs font-light text-white/80">
            {t(contextOf(challenge, subjects[0]?.salaryKind === 'entrada'))}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {subjects.map((career) => (
              <Link
                key={career.slug}
                to={`/carreiras/${career.slug}`}
                className="text-sm font-normal text-white underline underline-offset-4 hover:text-white/80"
              >
                {t('forYou.dailySeeCareer', { career: career.name })}
              </Link>
            ))}
          </div>
          <p className="text-xs font-light text-white/80">{t('forYou.dailyTomorrow')}</p>
        </div>
      )}
    </Card>
  )
}
