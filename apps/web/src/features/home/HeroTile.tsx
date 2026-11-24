import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { PhotoImg } from '../../components/PhotoImg'
import { ScoreRing } from '../../components/ScoreRing'
import { ButtonLink } from '../../components/ui/Button'
import { useCareers } from '../../data/queries'
import type { CareerSummary, Photo } from '../../data/types'
import { achievements, totalXp } from '../../domain/achievements'
import { useUser } from '../../state/userStore'
import { useNextStep } from './useNextStep'

const withPhoto = (careers: CareerSummary[] | undefined, slugs: (string | null | undefined)[]) =>
  slugs.map((slug) => careers?.find((career) => career.slug === slug)?.image).find(Boolean)

/** Hero: the greeting on the photo of the person's career, and always the next thing to do. */
export function HeroTile() {
  const { t } = useTranslation()
  const user = useUser()
  const { data: careers } = useCareers()
  const next = useNextStep()
  const photo: Photo | undefined =
    withPhoto(careers, [user.targetCareer, ...user.savedCareers]) ??
    careers?.find((career) => career.image)?.image
  const list = achievements(user)
  const earned = list.filter((achievement) => achievement.earned).length
  const xp = t('home.heroXp', { xp: totalXp(list, user.daily), earned, total: list.length })

  return (
    <section
      aria-labelledby="home-hero"
      className="relative flex min-h-72 min-w-0 rise flex-col justify-end overflow-hidden rounded-card bg-coal p-5 text-white sm:min-h-80 sm:p-6"
    >
      {photo && (
        <>
          <PhotoImg
            photo={photo}
            priority
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="absolute inset-0 size-full object-cover"
          />
          {/* Dark under the text, so white stays AA on any photo. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-coal via-coal/80 to-coal/40"
          />
        </>
      )}
      <div className="relative flex flex-col">
        <h1 id="home-hero" className="text-3xl leading-tight font-extrabold sm:text-4xl">
          {t('home.greeting', { name: user.profile?.name })}
        </h1>
        <p className="mt-4 text-xs font-light text-white/80">{t('home.heroNextLabel')}</p>
        <ButtonLink
          to={next.to}
          variant="onDark"
          size="lg"
          className="mt-2 self-start"
          data-tour={next.kind === 'test' || next.kind === 'cv' ? next.kind : undefined}
        >
          {next.label}
          <Icon name="arrowRight" className="size-4" />
        </ButtonLink>
        <div className="mt-6 flex items-center gap-3">
          <ScoreRing score={(earned / Math.max(list.length, 1)) * 100} tone="dark" label={xp} />
          <p aria-hidden="true" className="text-sm font-light text-white/90">
            {xp}
          </p>
        </div>
        {photo && (
          <p className="mt-3 text-[0.6875rem] font-light text-white/70" title={photo.alt}>
            {t('home.photoCredit', { author: photo.credit.author, license: photo.credit.license })}
          </p>
        )}
      </div>
    </section>
  )
}
