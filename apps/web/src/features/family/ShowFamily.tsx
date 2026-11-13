import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { CheckboxField } from '../../components/ui/Field'
import { useCareerDetails } from '../../data/queries'
import type { Career } from '../../data/types'
import { isMinor } from '../../domain/education'
import { careerFit } from '../../domain/fit'
import { riasecCode } from '../../domain/riasec'
import type { Locale } from '../../lib/i18n'
import { shareLink } from '../../lib/share'
import { useRiasecProfile } from '../../state/useRiasecProfile'
import { useUser } from '../../state/userStore'
import { FamilyPdfButton } from '../careers/FamilySheetButton'
import { familyLinkUrl, linkFirstName } from './familyLink'

function PdfFor({
  career,
  firstName,
  adult,
  withFit,
  named,
}: {
  career: Career
  firstName?: string
  adult: boolean
  withFit: boolean
  named: boolean
}) {
  const { t } = useTranslation()
  const user = useUser()
  const { profile } = useRiasecProfile()
  const fit = profile
    ? careerFit(career, { profile, education: user.profile?.education ?? null, skills: user.skills })
    : null
  return (
    <FamilyPdfButton
      career={career}
      options={{ firstName, showSalary: adult, fit }}
      withFit={withFit}
      label={named ? t('family.pdfFor', { name: career.name }) : t('familySheet.pdf')}
      className="w-full"
    />
  )
}

/**
 * "Mostrar à família": a link that carries the result in its fragment (docs/decisoes/0018) or a one-page PDF.
 * The first name goes only if the person ticks it; salaries only for adults.
 */
export function ShowFamily({ slugs, className = '' }: { slugs: string[]; className?: string }) {
  const { t, i18n } = useTranslation()
  const user = useUser()
  const { profile } = useRiasecProfile()
  const { data: careers } = useCareerDetails(slugs.slice(0, 3))
  const [open, setOpen] = useState(false)
  const [withName, setWithName] = useState(false)
  const [withFit, setWithFit] = useState(false)

  const name = linkFirstName(user.profile?.name)
  const firstName = withName ? name : undefined
  // Without a birth year we cannot know: treated as a minor.
  const adult = user.profile ? !isMinor(user.profile.birthYear) : false

  const sendLink = () => {
    const url = familyLinkUrl({
      v: 1,
      code: profile ? riasecCode(profile) : '',
      careers: careers.map((career) => career.slug),
      lang: (i18n.resolvedLanguage ?? 'pt') as Locale,
      ...(firstName ? { firstName } : {}),
      ...(adult ? { adult: true as const } : {}),
    })
    void shareLink(firstName ? t('family.shareTextNamed', { name: firstName }) : t('family.shareText'), url)
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className={className}>
        <Icon name="users" className="size-4" />
        {t('familySheet.button')}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t('familySheet.dialogTitle')}
        footer={
          <div className="space-y-2">
            <Button onClick={sendLink} disabled={careers.length === 0} className="w-full">
              <Icon name="share" className="size-4" />
              {t('family.sendLink')}
            </Button>
            {careers.map((career) => (
              <PdfFor
                key={career.slug}
                career={career}
                firstName={firstName}
                adult={adult}
                withFit={withFit}
                named={careers.length > 1}
              />
            ))}
          </div>
        }
      >
        <p className="text-sm leading-relaxed font-light text-copy">{t('family.dialogBody')}</p>
        <div className="mt-5 space-y-3">
          {name && (
            <CheckboxField
              label={t('family.withName', { name })}
              checked={withName}
              onChange={(event) => setWithName(event.target.checked)}
            />
          )}
          {profile && (
            <CheckboxField
              label={t('familySheet.includeFit')}
              checked={withFit}
              onChange={(event) => setWithFit(event.target.checked)}
            />
          )}
        </div>
        <p className="mt-4 rounded-2xl bg-ash-100 p-4 text-xs leading-relaxed font-light text-copy">
          <Icon name="lock" className="mr-1 inline size-3.5 align-[-2px] text-night" />
          {t('family.linkPrivacy')}
        </p>
        <p className="mt-2 text-xs font-light text-muted">{t('familySheet.privacy')}</p>
      </Dialog>
    </>
  )
}
