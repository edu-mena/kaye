import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Segmented } from '../../components/ui/Segmented'
import type { Skill, SkillLevel } from '../../data/types'
import { userActions, useUser } from '../../state/userStore'

const LEVELS = ['none', 'aprender', 'sei', 'domino'] as const
type Choice = (typeof LEVELS)[number]

type SkillsDialogProps = { skills: Skill[]; open: boolean; onClose: () => void }

export function SkillsDialog({ skills, open, onClose }: SkillsDialogProps) {
  const { t } = useTranslation()
  const user = useUser()
  const ordered = skills.toSorted(
    (a, b) => Number(a.importance === 'opcional') - Number(b.importance === 'opcional'),
  )
  const labels: Record<Choice, string> = {
    none: t('fit.levelNone'),
    aprender: t('fit.levelaprender'),
    sei: t('fit.levelsei'),
    domino: t('fit.leveldomino'),
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('fit.dialogTitle')}
      footer={
        <Button className="w-full" onClick={onClose}>
          {t('fit.done')}
        </Button>
      }
    >
      <p className="mb-6 text-sm font-light text-copy">{t('fit.dialogHint')}</p>
      <ul className="space-y-6">
        {ordered.map((skill) => (
          <li key={skill.id}>
            <p className="mb-2 text-sm font-semibold text-night">
              {skill.name}
              {skill.importance === 'essencial' && <span className="ml-1 text-gold-ink">*</span>}
            </p>
            <Segmented<Choice>
              label={skill.name}
              value={user.skills[skill.id] ?? 'none'}
              onChange={(value) =>
                userActions.setSkill(skill.id, value === 'none' || !value ? null : (value as SkillLevel))
              }
              options={LEVELS.map((value) => ({ value, label: labels[value] }))}
            />
          </li>
        ))}
      </ul>
    </Dialog>
  )
}
