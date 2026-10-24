import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon, type IconName } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { ProgressBar } from '../../components/ui/ProgressBar'
import type { Career } from '../../data/types'
import { careerFit } from '../../domain/fit'
import { useRiasecProfile } from '../../state/useRiasecProfile'
import { useUser } from '../../state/userStore'
import { SkillsDialog } from './SkillsDialog'

function Part({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 bg-coal p-5">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-gold">
        <Icon name={icon} className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold tracking-[0.14em] text-white/75 uppercase">{title}</p>
        <div className="mt-1.5 text-sm font-light text-white">{children}</div>
      </div>
    </div>
  )
}

type FitPanelProps = {
  career: Career
  /** Controlled by the page, so the hero's "Encaixe" button can open it. */
  expanded: boolean
  onToggle: () => void
}

/** "O meu encaixe": interests, education and skills, each on its own (docs/arquitetura.md, 5.4). */
export function FitPanel({ career, expanded, onToggle }: FitPanelProps) {
  const { t } = useTranslation()
  const user = useUser()
  const { profile } = useRiasecProfile()
  const [open, setOpen] = useState(false)
  const fit = careerFit(career, { profile, education: user.profile?.education ?? null, skills: user.skills })
  const link = 'font-normal text-white underline underline-offset-4'

  return (
    <Card as="section" tone="coal" id="encaixe" aria-labelledby="fit-title" className="scroll-mt-44 sm:p-8">
      <h2 id="fit-title" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="fit-body"
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-3 rounded-xl text-left"
        >
          {t('fit.title')}
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white">
            <Icon
              name="chevronRight"
              className={`size-5 transition ${expanded ? '-rotate-90' : 'rotate-90'}`}
            />
          </span>
        </button>
      </h2>
      <p className="mt-1 max-w-2xl text-white/80">{t('fit.subtitle')}</p>

      <div
        id="fit-body"
        hidden={!expanded}
        className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-white/10 lg:grid-cols-3"
      >
        <Part icon="target" title={t('fit.interests')}>
          {fit.interests ? (
            <>
              <Chip tone={fit.interests.level === 'alto' ? 'gold' : 'onDark'}>
                {t(`fit.${fit.interests.level}`)}
              </Chip>
              <p className="mt-2 text-sm">
                {t('fit.interestsWhy', { dimension: t(`riasec.${fit.interests.strength}`) })}
              </p>
            </>
          ) : (
            <Link to="/teste" className={link}>
              {t('fit.interestsNone')}
            </Link>
          )}
        </Part>

        <Part icon="cap" title={t('fit.education')}>
          {fit.education ? (
            <p className="text-sm">
              {t('fit.educationSteps', {
                count: fit.education.steps.length,
                pathway: fit.education.pathwayName.toLowerCase(),
              })}
            </p>
          ) : (
            <Link to="/entrar" className={link}>
              {t('fit.educationNone')}
            </Link>
          )}
        </Part>

        <Part icon="check" title={t('fit.skills')}>
          <p className="font-normal">
            {t('fit.skillsCount', { have: fit.skills.have, total: fit.skills.total })}
          </p>
          <ProgressBar
            className="my-2"
            tone="gold"
            track="bg-white/15"
            value={fit.skills.total ? fit.skills.have / fit.skills.total : 0}
            label={t('fit.skills')}
          />
          <p className="text-sm text-white/80">
            {fit.skills.missing.length === 0
              ? t('fit.skillsAll')
              : t('fit.skillsMissing', { list: fit.skills.missing.map((skill) => skill.name).join(', ') })}
          </p>
          <Button size="sm" className="mt-3" onClick={() => setOpen(true)}>
            {t('fit.markSkills')}
          </Button>
        </Part>
      </div>

      <SkillsDialog skills={career.skills} open={open} onClose={() => setOpen(false)} />
    </Card>
  )
}
