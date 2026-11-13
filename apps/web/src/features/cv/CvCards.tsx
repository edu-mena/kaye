import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '../../components/icons'
import { Button, ButtonLink } from '../../components/ui/Button'
import { SectionHeading } from '../../components/ui/PageHeader'
import type { CvDocument } from '../../data/types'
import { downloadCardPdf } from './cardExport'
import { CARD_HEIGHT, CARD_WIDTH } from './cardLayout'
import { OpsSvg } from './CvSheet'
import { useCardFaces } from './useCardFaces'

/** Each CV's business card: a row that slides on phones, a grid on large screens. */
export function CvCards({ cvs }: { cvs: CvDocument[] }) {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="my-cards" className="mb-12">
      <SectionHeading id="my-cards" title={t('cv.cardMine')} icon="user" />
      <p className="-mt-3 mb-5 text-sm font-light text-copy">{t('cv.cardMineBody')}</p>
      <ul className="-mx-3 no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {cvs.map((document) => (
          <CardTile key={document.id} document={document} />
        ))}
      </ul>
    </section>
  )
}

/** One card: its front, large, on a grey stage; edit it or take the PDF. */
function CardTile({ document }: { document: CvDocument }) {
  const { t } = useTranslation()
  const { model, faces, family, source } = useCardFaces(document)
  const to = `/cv/cartao?cv=${document.id}`
  const title = document.title || t('cv.mine')

  return (
    <li className="w-72 shrink-0 snap-start overflow-hidden rounded-card border border-line bg-surface shadow-card sm:w-auto">
      <Link
        to={to}
        aria-label={`${t('cv.cardEdit')}: ${title}`}
        className="group block bg-ash-100 p-6 focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-inset"
      >
        <span className="block overflow-hidden rounded-lg shadow-lift transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-[-1deg]">
          <OpsSvg ops={faces.front} width={CARD_WIDTH} height={CARD_HEIGHT} family={family} />
        </span>
      </Link>
      <div className="flex items-center gap-2 p-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-night">{title}</h3>
          <p className="mt-0.5 truncate text-xs font-light text-copy">{t(`cv.cardModel_${model}`)}</p>
        </div>
        <ButtonLink to={to} size="xs" variant="secondary">
          <Icon name="pencil" className="size-4" />
          {t('cv.editTab')}
        </ButtonLink>
        <Button size="xs" variant="ghost" onClick={() => void downloadCardPdf(source)}>
          <Icon name="download" className="size-4" />
          {t('cv.cardPdf')}
        </Button>
      </div>
    </li>
  )
}
