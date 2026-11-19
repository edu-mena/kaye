import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { wantsShortPath } from '../../domain/strengths'
import { useUser } from '../../state/userStore'

/** On the home, for who said in the test that they need to work now or want to study little. */
export function NoDegreeCard() {
  const { t } = useTranslation()
  const { strengths } = useUser()
  if (!wantsShortPath(strengths)) return null

  return (
    <Card as="section" aria-labelledby="home-no-degree" className="flex flex-wrap items-center gap-4 p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-coal text-gold">
        <Icon name="helmet" className="size-5" />
      </span>
      <div className="min-w-0 flex-1 basis-56">
        <h2 id="home-no-degree" className="text-base font-semibold text-night">
          {t('noDegree.homeTitle')}
        </h2>
        <p className="mt-0.5 text-sm font-light text-copy">{t('noDegree.homeBody')}</p>
      </div>
      <ButtonLink to="/sem-universidade" variant="secondary">
        {t('noDegree.homeCta')}
        <Icon name="arrowRight" className="size-4" />
      </ButtonLink>
    </Card>
  )
}
