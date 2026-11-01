import type { ComponentProps } from 'react'
import heroLarge from '../assets/heroes/cursos-1600.webp'
import heroSmall from '../assets/heroes/cursos-800.webp'
import { StatPills } from './ListHero'

const CURSOS_PHOTO = { small: heroSmall, large: heroLarge, largeWidth: 1600 }

type CoverHeroProps = {
  title: string
  stats: ComponentProps<typeof StatPills>['stats']
  /** The photo behind, two sizes; the Cursos one by default. */
  photo?: { small: string; large: string; largeWidth: number }
}

/**
 * The top of a directory page (Academias, Empresas): a short band, centred over a photo that
 * covers it, darkened so the title and the numbers read.
 */
export function CoverHero({ title, stats, photo = CURSOS_PHOTO }: CoverHeroProps) {
  return (
    <section
      aria-labelledby="cover-title"
      className="relative grid min-h-[16rem] place-items-center overflow-hidden rounded-card px-6 py-10 text-center shadow-card sm:min-h-[18rem] lg:min-h-[14rem]"
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
        <div className="mt-6 flex justify-center">
          <StatPills stats={stats} />
        </div>
      </div>
    </section>
  )
}
