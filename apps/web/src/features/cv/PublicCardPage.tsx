import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { PublicShell as Shell } from '../../components/PublicShell'
import { Icon, type IconName } from '../../components/icons'
import { usePublicCard } from '../../data/queries'
import type { PublicCard } from '../../data/types'

type Action = { icon: IconName; label: string; href: string }

// Links are checked by the server; this keeps a bad one out even if that ever changes.
const safe = (link?: string) => (link && /^https?:\/\//i.test(link) ? link : null)

function actions(card: PublicCard, labels: Record<'email' | 'whatsapp' | 'linkedin' | 'portfolio', string>) {
  const list: Action[] = []
  if (card.whatsapp)
    list.push({
      icon: 'message',
      label: labels.whatsapp,
      href: `https://wa.me/${card.whatsapp.replace(/\D/g, '')}`,
    })
  if (card.email) list.push({ icon: 'document', label: labels.email, href: `mailto:${card.email}` })
  const linkedin = safe(card.linkedin)
  if (linkedin) list.push({ icon: 'users', label: labels.linkedin, href: linkedin })
  const portfolio = safe(card.portfolio)
  if (portfolio) list.push({ icon: 'globe', label: labels.portfolio, href: portfolio })
  return list
}

/** /c/:slug, outside the app's layout: what someone sees after scanning a card. */
export default function PublicCardPage() {
  const { t } = useTranslation()
  const { slug = '' } = useParams()
  const { data: card, isPending, isError } = usePublicCard(slug)

  if (isPending) return <Shell>{null}</Shell>

  if (isError || !card) {
    return (
      <Shell>
        <div className="pt-16 text-center">
          <h1 className="text-2xl font-extrabold text-night">
            {t(isError ? 'publicCard.errorTitle' : 'publicCard.goneTitle')}
          </h1>
          <p className="mt-2 text-sm font-light text-copy">
            {t(isError ? 'publicCard.errorBody' : 'publicCard.goneBody')}
          </p>
        </div>
      </Shell>
    )
  }

  const list = actions(card, {
    email: t('publicCard.email'),
    whatsapp: t('publicCard.whatsapp'),
    linkedin: t('publicCard.linkedin'),
    portfolio: t('publicCard.portfolio'),
  })

  return (
    <Shell>
      <div className="text-center">
        {card.photo ? (
          <img src={card.photo} alt="" className="mx-auto size-28 rounded-full object-cover shadow-card" />
        ) : (
          <span
            aria-hidden="true"
            className="mx-auto block size-4 rounded-full"
            style={{ backgroundColor: card.accent }}
          />
        )}
        <h1 className="mt-4 text-3xl font-extrabold break-words text-night">{card.name}</h1>
        {card.headline && <p className="mt-1 text-base font-light text-copy">{card.headline}</p>}
      </div>
      <ul className="mt-8 space-y-3">
        {list.map((action) => (
          <li key={action.label}>
            <a
              href={action.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-full px-5 py-3.5 font-semibold text-white shadow-card"
              style={{ backgroundColor: card.accent }}
            >
              <Icon name={action.icon} className="size-5" />
              {action.label}
            </a>
          </li>
        ))}
      </ul>
    </Shell>
  )
}
