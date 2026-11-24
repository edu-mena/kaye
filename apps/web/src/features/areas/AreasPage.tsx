import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Loading, CardsSkeleton } from '../../components/PageStates'
import { PathMark } from '../../components/PathMark'
import { PhotoImg } from '../../components/PhotoImg'
import { QueryState } from '../../components/QueryState'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAcademies, useCareers, useCompanies, usePrograms } from '../../data/queries'
import { MARKET_AREAS } from '../../data/types'
import { areaStats } from './stats'

/** Every area of the catalogue (only those with careers), each with its photo and what it holds. */
export default function AreasPage() {
  const { t } = useTranslation()
  const query = useCareers()
  const { data: programs = [] } = usePrograms()
  const { data: academies = [] } = useAcademies()
  const { data: companies = [] } = useCompanies()

  return (
    <div>
      <PageHeader title={t('areas.title')} subtitle={t('areas.body')} />
      <QueryState
        query={query}
        loading={
          <Loading>
            <CardsSkeleton />
          </Loading>
        }
      >
        {(careers) => {
          const areas = MARKET_AREAS.map((area) =>
            areaStats(area, { careers, programs, academies, companies }),
          ).filter((stats) => stats.careers.length > 0)
          return (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {areas.map((stats) => (
                <li key={stats.area}>
                  <Link
                    to={`/areas/${stats.area}`}
                    className="group block h-full overflow-hidden rounded-card bg-surface shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                  >
                    <span className="relative block h-40 overflow-hidden bg-night">
                      {stats.photo ? (
                        <PhotoImg
                          photo={stats.photo}
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                        />
                      ) : (
                        <PathMark className="absolute -right-8 bottom-0 w-64 max-w-none opacity-70" />
                      )}
                    </span>
                    <span className="block p-5">
                      <span className="block text-lg font-semibold text-night">
                        {t(`market.area_${stats.area}`)}
                      </span>
                      <span className="mt-2 block text-xs font-light text-muted">
                        {[
                          t('areas.careers', { count: stats.careers.length }),
                          t('areas.courses', { count: stats.courses }),
                          t('areas.academies', { count: stats.academies }),
                          t('areas.companies', { count: stats.companies }),
                        ].join(' · ')}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )
        }}
      </QueryState>
    </div>
  )
}
