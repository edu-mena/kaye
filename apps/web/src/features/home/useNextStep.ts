import { useTranslation } from 'react-i18next'
import { useCareers } from '../../data/queries'
import { nextStep } from '../../domain/journey'
import { strengthsDone } from '../../domain/strengths'
import { useRiasecProfile } from '../../state/useRiasecProfile'
import { activeCv, useUser } from '../../state/userStore'

/** The next thing to do, in the order of the journey; the same one the "A tua jornada" card is on. */
export function useNextStep() {
  const { t } = useTranslation()
  const user = useUser()
  const { completed } = useRiasecProfile()
  const { data: careers } = useCareers()
  const target = careers?.find((career) => career.slug === user.targetCareer)
  const step = nextStep({
    testDone: completed,
    strengthsDone: strengthsDone(user.strengths),
    hasCv: activeCv(user) !== null,
    hasPlan: user.plan !== null,
    // A target that is no longer in the catalogue is as good as none.
    targetCareer: target?.slug ?? null,
  })
  switch (step.kind) {
    case 'test':
      return { kind: step.kind, to: '/teste', label: t('home.heroNextTest') }
    case 'strengths':
      return { kind: step.kind, to: '/teste/valencias', label: t('assessment.completeStrengths') }
    case 'cv':
      return { kind: step.kind, to: '/cv', label: t('home.heroNextCv') }
    case 'plan':
      return {
        kind: step.kind,
        to: `/carreiras/${step.career}?secao=path`,
        label: t('home.heroNextPlan', { career: target?.name }),
      }
    case 'explore':
      return { kind: step.kind, to: '/carreiras', label: t('home.heroNextExplore') }
  }
}
