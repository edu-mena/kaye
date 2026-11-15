import { useTranslation } from 'react-i18next'
import { Icon } from '../../components/icons'
import { ButtonLink } from '../../components/ui/Button'
import { useVisibleMentors } from './useVisibleMentors'

/** On the career page: a link to the career's mentors, only when there is one. */
export function CareerMentorsLink({ careerSlug }: { careerSlug: string }) {
  const { t } = useTranslation()
  const count = useVisibleMentors().filter((mentor) => mentor.careers.includes(careerSlug)).length
  if (count === 0) return null
  return (
    <ButtonLink to={`/mentores?carreira=${careerSlug}`} variant="secondary" className="mt-6">
      <Icon name="users" className="size-4" />
      {t('mentors.careerLink', { count })}
    </ButtonLink>
  )
}
