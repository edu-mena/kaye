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
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-navy-100 text-navy">
        <Icon name={icon} className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-muted">{title}</p>
        <div className="mt-0.5 text-sm text-navy">{children}</div>
      </div>
    </div>
  )
}

/** "O meu encaixe": interests, education and skills, each on its own (docs/arquitetura.md, 5.4). */
export function FitPanel({ career }: { career: Career }) {
  const { t } = useTranslation()
  const user = useUser()
  const { profile } = useRiasecProfile()
  const [open, setOpen] = useState(false)
  const fit = careerFit(career, { profile, education: user.profile?.education ?? null, skills: user.skills })

  return (
    <Card as="section" aria-labelledby="fit-title" className="space-y-5">
      <h2 id="fit-title" className="text-xl font-semibold text-navy">
        {t('fit.title')}
      </h2>

      <Part icon="target" title={t('fit.interests')}>
        {fit.interests ? (
          <>
            <Chip tone={fit.interests.level === 'alto' ? 'success' : 'neutral'}>
              {t(`fit.${fit.interests.level}`)}
            </Chip>
            <p className="mt-1">
              {t('fit.interestsWhy', { dimension: t(`riasec.${fit.interests.strength}`) })}
            </p>
          </>
        ) : (
          <Link to="/teste" className="font-semibold underline underline-offset-4">
            {t('fit.interestsNone')}
          </Link>
        )}
      </Part>

      <Part icon="cap" title={t('fit.education')}>
        {fit.education ? (
          <p>
            {t('fit.educationSteps', {
              count: fit.education.steps.length,
              pathway: fit.education.pathwayName.toLowerCase(),
            })}
          </p>
        ) : (
          <Link to="/entrar" className="font-semibold underline underline-offset-4">
            {t('fit.educationNone')}
          </Link>
        )}
      </Part>

      <Part icon="check" title={t('fit.skills')}>
        <p>{t('fit.skillsCount', { have: fit.skills.have, total: fit.skills.total })}</p>
        <ProgressBar
          className="my-2"
          tone="success"
          value={fit.skills.total ? fit.skills.have / fit.skills.total : 0}
          label={t('fit.skills')}
        />
        <p className="text-muted">
          {fit.skills.missing.length === 0
            ? t('fit.skillsAll')
            : t('fit.skillsMissing', { list: fit.skills.missing.map((skill) => skill.name).join(', ') })}
        </p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => setOpen(true)}>
          {t('fit.markSkills')}
        </Button>
      </Part>

      <SkillsDialog skills={career.skills} open={open} onClose={() => setOpen(false)} />
    </Card>
  )
}
