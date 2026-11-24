import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { PlusBadge } from '../../components/PlusBadge'
import { Button, ButtonLink } from '../../components/ui/Button'
import { usePlus } from '../../lib/plan'
import { PlusGate } from '../plus/PlusGate'

type Props = { size: 'sm' | 'lg'; className?: string; onDownload: () => void }

/** "Descarregar PDF": part of Kayé Plus, free the first time. Closed, it leads to the Plus page. */
export function CvDownloadButton({ size, className, onDownload }: Props) {
  const { t } = useTranslation()
  const { spendTrial } = usePlus()
  const icon = size === 'lg' ? 'size-5' : 'size-4'
  return (
    <PlusGate
      feature="cv_pdf"
      fallback={
        <ButtonLink to="/plus" size={size} variant="secondary" className={className}>
          <Icon name="lock" className={icon} />
          {t('cv.download')}
          <PlusBadge />
        </ButtonLink>
      }
    >
      <Button
        size={size}
        className={className}
        onClick={() => {
          onDownload()
          spendTrial('cv_pdf')
        }}
      >
        <Icon name="download" className={icon} />
        {t('cv.download')}
      </Button>
    </PlusGate>
  )
}
