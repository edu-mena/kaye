import type { ComponentProps } from 'react'
import heroLarge from '../assets/heroes/cursos-1600.webp'
import heroSmall from '../assets/heroes/cursos-800.webp'
import { Icon, type IconName } from './icons'
import { HERO_CONTROL, HeroField, StatPills } from './ListHero'

type Option = { value: string; label: string }

const CURSOS_PHOTO = { small: heroSmall, large: heroLarge, largeWidth: 1600 }

type CoverHeroProps = {
  title: string
  body: string
  /** The page's main question, as a select. */
  question: {
    label: string
    icon: IconName
    placeholder: string
    value: string | null
    options: Option[]
    onChange: (value: string | null) => void
  }
  stats: ComponentProps<typeof StatPills>['stats']
  /** The photo behind, two sizes; the Cursos one by default. */
  photo?: { small: string; large: string; largeWidth: number }
}

/**
 * The top of a directory page (Academias, Empresas): the size and type of ListHero, but centred
 * over a photo that covers it, darkened so the text reads.
 */
export function CoverHero({ title, body, question, stats, photo = CURSOS_PHOTO }: CoverHeroProps) {
  return (
    <section
      aria-labelledby="cover-title"
      className="relative grid min-h-[38rem] place-items-center overflow-hidden rounded-card px-6 py-10 text-center shadow-card sm:min-h-[34rem] sm:px-10 lg:min-h-[23rem]"
    >
      <img
        src={photo.small}
        srcSet={`${photo.small} 800w, ${photo.large} ${photo.largeWidth}w`}
        sizes="(min-width: 1024px) 80vw, 100vw"
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-coal/75" />
      <div className="relative w-full max-w-2xl">
        <h1 id="cover-title" className="text-3xl leading-tight font-extrabold text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm font-light text-white/85">{body}</p>
        <label className="mx-auto mt-8 block max-w-lg">
          <span className="block text-sm font-light text-white/85">{question.label}</span>
          <span className="mt-3 block text-left">
            <HeroField icon={question.icon}>
              <select
                value={question.value ?? ''}
                onChange={(event) => question.onChange(event.target.value || null)}
                className={HERO_CONTROL}
              >
                <option value="">{question.placeholder}</option>
                {question.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Icon
                name="chevronRight"
                className="pointer-events-none absolute top-1/2 right-5 size-5 -translate-y-1/2 rotate-90 text-night"
              />
            </HeroField>
          </span>
        </label>
        <div className="flex justify-center">
          <StatPills stats={stats} />
        </div>
      </div>
    </section>
  )
}
