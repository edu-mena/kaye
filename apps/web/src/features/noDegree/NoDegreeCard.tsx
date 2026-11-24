import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

/** A card of the home feed, for who said in the test that they need to work now or want to study little. */
export function NoDegreeCard({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useTranslation()

  return (
    <Card as="article" aria-labelledby="home-no-degree" className="p-5">
      <div className="flex items-center gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue text-white">
          <Icon name="helmet" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="home-no-degree" className="text-base font-semibold text-night">
            {t('noDegree.homeTitle')}
          </h2>
          <p className="mt-0.5 text-sm font-light text-copy">{t('noDegree.homeBody')}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <ButtonLink to="/sem-universidade" variant="secondary" size="sm">
          {t('noDegree.homeCta')}
          <Icon name="arrowRight" className="size-4" />
        </ButtonLink>
        <button
          type="button"
          aria-label={t('forYou.dismiss')}
          onClick={onDismiss}
          className="ml-auto grid size-9 place-items-center rounded-full border border-line bg-surface text-night hover:bg-ash-100"
        >
          <Icon name="close" className="size-4" />
        </button>
      </div>
    </Card>
  )
}
