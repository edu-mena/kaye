import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '../../components/icons'
import { ScoreRing } from '../../components/ScoreRing'
import { Button } from '../../components/ui/Button'
import type { CvDocument, CvExample } from '../../data/types'
import { cvCompleteness } from '../../domain/cv'
import { formatPercent } from '../../domain/format'
import { useUser } from '../../state/userStore'
import { ScaledSheet } from './CvSheet'
import { CvMissing } from './CvMissing'

type CvHeroProps = {
  /** The CV the person worked on last; null before the first one. */
  current: CvDocument | null
  /** Model CVs for the fanned sheets of the empty state. */
  examples: CvExample[]
  onCreate: () => void
  onEdit: (id: string) => void
}

const STEPS: { icon: IconName; key: 'step1' | 'step2' | 'step3' }[] = [
  { icon: 'palette', key: 'step1' },
  { icon: 'pencil', key: 'step2' },
  { icon: 'download', key: 'step3' },
]

// Three sheets fanned out like on a desk: the front one straight, the others turned.
const FAN = [
  'left-0 top-6 -rotate-[9deg] opacity-80',
  'right-0 top-4 rotate-[8deg] opacity-90',
  'left-1/2 top-0 -translate-x-1/2 rotate-[-1deg] z-10',
]

/** The top of the CV page: what to do next, on a dark block, beside a picture of the sheet. */
export function CvHero({ current, examples, onCreate, onEdit }: CvHeroProps) {
  const { t } = useTranslation()
  const { photo } = useUser()
  const completeness = current ? cvCompleteness(current.cv) : 0
  const title = current ? current.title || t('cv.mine') : ''

  return (
    <section
      aria-labelledby="cv-hero"
      className="relative mb-10 rise overflow-hidden rounded-card bg-coal p-6 text-white shadow-lift sm:p-8 lg:p-10"
    >
      <span aria-hidden="true" className="absolute -top-24 -right-24 size-72 rounded-full bg-blue/25" />
      <span aria-hidden="true" className="absolute -bottom-20 left-1/3 size-48 rounded-full bg-gold/10" />
      <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-gold uppercase">{t('cv.studioEyebrow')}</p>
          <h1 id="cv-hero" className="mt-2 text-3xl leading-tight font-extrabold sm:text-4xl">
            {current ? title : t('cv.heroTitle')}
          </h1>
          {current ? (
            <>
              <div className="mt-5 flex items-center gap-4">
                <ScoreRing
                  score={completeness * 100}
                  size="lg"
                  tone="dark"
                  label={t('cv.completeness', { value: formatPercent(completeness) })}
                />
                <div className="min-w-0 text-sm">
                  <p className="font-semibold">
                    {completeness >= 1
                      ? t('cv.ready')
                      : t('cv.completeness', { value: formatPercent(completeness) })}
                  </p>
                  <p className="mt-0.5 font-light text-white/70">
                    {t('cv.heroCurrent')} · {t(`cv.template_${current.template}`)}
                  </p>
                </div>
              </div>
              <CvMissing cv={current.cv} tone="dark" className="mt-4 max-w-md" />
            </>
          ) : (
            <>
              <p className="mt-3 max-w-md text-sm font-light text-white/80 sm:text-base">
                {t('cv.heroBody')}
              </p>
              <ol aria-label={t('cv.stepsLabel')} className="mt-6 grid gap-3 sm:grid-cols-3">
                {STEPS.map((step, index) => (
                  <li key={step.key} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-gold">
                      <Icon name={step.icon} className="size-5" />
                    </span>
                    <span className="text-sm">
                      <span className="block text-xs font-light text-white/60">{index + 1}</span>
                      {t(`cv.${step.key}`)}
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            {current ? (
              <>
                <Button variant="onDark" size="lg" onClick={() => onEdit(current.id)}>
                  <Icon name="pencil" className="size-4" />
                  {t('cv.continueEditing')}
                </Button>
                <Button variant="onDarkOutline" size="lg" onClick={onCreate}>
                  <Icon name="plus" className="size-4" />
                  {t('cv.create')}
                </Button>
              </>
            ) : (
              <Button variant="onDark" size="lg" onClick={onCreate}>
                <Icon name="plus" className="size-4" />
                {t('cv.create')}
              </Button>
            )}
          </div>
        </div>

        {/* Decorative: the real sheet, or model sheets fanned out before the first CV. */}
        <div aria-hidden="true" className="relative mx-auto h-64 w-60 sm:h-72 sm:w-72">
          {current ? (
            <>
              <span className="absolute top-6 left-4 h-56 w-40 rotate-[-8deg] rounded-lg bg-white/10 sm:h-64 sm:w-44" />
              <div className="absolute top-0 left-1/2 w-40 -translate-x-1/2 rotate-[3deg] overflow-hidden rounded-lg shadow-lift transition-transform duration-300 hover:rotate-0 sm:w-48">
                <ScaledSheet
                  cv={current.cv}
                  template={current.template}
                  style={current.style}
                  photo={photo}
                />
              </div>
            </>
          ) : (
            examples.slice(0, 3).map((example, index) => (
              <div
                key={example.id}
                className={`absolute w-36 overflow-hidden rounded-lg shadow-lift sm:w-44 ${FAN[index]}`}
              >
                <ScaledSheet cv={example.cv} template={example.template} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
