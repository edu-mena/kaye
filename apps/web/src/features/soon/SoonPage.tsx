import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '../../components/icons'
import { PathMark } from '../../components/PathMark'
import { ButtonLink } from '../../components/ui/Button'

export type SoonSection =
  'search' | 'academies' | 'companies' | 'market' | 'news' | 'notifications' | 'support' | 'settings'

const ICONS: Record<SoonSection, IconName> = {
  search: 'search',
  academies: 'landmark',
  companies: 'building',
  market: 'chart',
  news: 'newspaper',
  notifications: 'bell',
  support: 'help',
  settings: 'sliders',
}

/** A designed "coming soon" for sections that wait for their demo data. */
export default function SoonPage({ section }: { section: SoonSection }) {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden rounded-card bg-night p-8 text-white sm:p-12">
      <PathMark className="absolute -right-20 -bottom-8 w-[30rem] max-w-none opacity-60" />
      <span className="relative grid size-14 place-items-center rounded-2xl bg-white text-night">
        <Icon name={ICONS[section]} className="size-7" />
      </span>
      <p className="relative mt-8 flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-gold uppercase">
        <span aria-hidden="true" className="size-2 rotate-45 bg-gold" />
        {t('soon.badge')}
      </p>
      <h1 className="relative mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
        {t(`nav.${section}`)}
      </h1>
      <p className="relative mt-4 max-w-xl text-lg text-white/80">{t(`soon.${section}`)}</p>
      <ButtonLink to="/" variant="onNavy" className="relative mt-8">
        {t('soon.back')}
      </ButtonLink>
    </section>
  )
}
