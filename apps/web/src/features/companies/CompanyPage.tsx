import type { TFunction } from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { DemandMeter } from '../../components/DemandMeter'
import { DetailLayout, DetailSection, StatBlock, Subheading } from '../../components/DetailLayout'
import {
  ContactsBlock,
  DetailBlock,
  DetailHero,
  ExternalLink,
  SoonBlock,
  SourcesBlock,
} from '../../components/DetailParts'
import { FilteredGrid } from '../../components/FilteredGrid'
import { GROUP_ICONS } from '../../components/groupIcons'
import { InstitutionLogo } from '../../components/InstitutionLogo'
import { Icon, type IconName } from '../../components/icons'
import { DetailSkeleton, Loading, NotFoundState, RowsSkeleton } from '../../components/PageStates'
import { QueryState } from '../../components/QueryState'
import { ButtonLink } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { Dialog } from '../../components/ui/Dialog'
import { useAcademies, useCareer, useCareers, useCompany, useNews } from '../../data/queries'
import type { CareerSummary, Company, CompanyPerson, Demand, SourceLink } from '../../data/types'
import { companyNeeds, companyRoles } from '../../domain/companyNeeds'
import { useNewsForMe } from '../../lib/useNewsForMe'
import { NewsCard } from '../news/NewsCard'
import { SaveCompany } from './SaveCompany'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { CareersEvaluation, CareersMarket } from '../careers/CareersOverview'
import { InternshipsOfCompany } from '../internships/InternshipLinks'

const TABS = [
  { id: 'geral', icon: 'eye' },
  { id: 'mercado', icon: 'chart' },
  { id: 'profissoes', icon: 'briefcase' },
  { id: 'noticias', icon: 'newspaper' },
  { id: 'avaliacao', icon: 'user' },
] as const satisfies readonly { id: string; icon: IconName }[]

type TabId = (typeof TABS)[number]['id']

const DEMANDS: Demand[] = ['alta', 'media', 'baixa']

/**
 * A company's page, in five tabs: what it is, its people and its programmes for young people, the market of the
 * careers it hires for, its posts and those careers (one opens what it takes to work in it at this company,
 * estimated, also from ?profissao=), its news and how the careers fit the user. Contacts, partner academies and sources stay at the side.
 */
export default function CompanyPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const companyQuery = useCompany(id)

  return (
    <QueryState query={companyQuery} loading={<DetailSkeleton />}>
      {(company) =>
        company ? (
          <CompanyView company={company} />
        ) : (
          <NotFoundState
            title={t('company.notFoundTitle')}
            body={t('company.notFound')}
            action={{ to: '/empresas', label: t('company.back') }}
          />
        )
      }
    </QueryState>
  )
}

function CompanyView({ company }: { company: Company }) {
  const { t } = useTranslation()
  const [params, setParam] = useUrlFilters()
  const { data: allCareers = [] } = useCareers()
  const { data: academies = [] } = useAcademies()
  const careers = allCareers.filter((career) => company.careers.includes(career.slug))
  const partners = academies.filter((academy) => company.partners.includes(academy.id))
  const tabs = TABS.map((tab) => ({ id: tab.id, icon: tab.icon, label: t(`company.tab_${tab.id}`) }))
  const active: TabId =
    tabs.find((tab) => tab.id === params.get('secao'))?.id ??
    (params.get('profissao') ? 'profissoes' : 'geral')

  return (
    <DetailLayout
      header={
        <DetailHero
          entity={company}
          back={{ to: '/empresas', label: t('company.back') }}
          meta={t(`companies.sector_${company.sector}`)}
          actions={<SaveCompany id={company.id} name={company.name} />}
        />
      }
      tabs={{
        label: t('company.tabsLabel'),
        items: tabs,
        value: active,
        onChange: (tab) =>
          setParam('secao', tab === 'geral' ? null : tab, tab === 'profissoes' ? [] : ['profissao']),
        idPrefix: 'company',
      }}
      aside={
        <>
          <ContactsBlock website={company.website} social={company.socials} />
          {partners.length > 0 && (
            <DetailBlock id="partners" icon="landmark" title={t('company.partnersTitle')}>
              <ul className="space-y-2 text-sm">
                {partners.map((academy) => (
                  <li key={academy.id}>
                    <Link
                      to={`/academias/${academy.id}`}
                      className="font-normal text-night underline underline-offset-2 hover:text-blue"
                    >
                      {academy.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </DetailBlock>
          )}
          <SourcesBlock sources={company.sources} />
        </>
      }
    >
      {active === 'geral' && <General company={company} />}
      {active === 'mercado' && (
        <DetailSection id="mercado" title={t('company.tab_mercado')} icon="chart">
          <CareersMarket
            slugs={company.careers}
            intro={t('company.marketIntro')}
            none={t('company.marketNone')}
          />
        </DetailSection>
      )}
      {active === 'profissoes' && <Careers company={company} careers={careers} />}
      {active === 'noticias' && <CompanyNews id={company.id} />}
      {active === 'avaliacao' && (
        <DetailSection id="avaliacao" title={t('company.tab_avaliacao')} icon="user">
          <CareersEvaluation
            careers={careers}
            count={{ label: t('company.statCareers'), value: careers.length }}
            note={t('company.evalNote')}
            fitSubtitle={t('company.fitSubtitle')}
          >
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <SoonBlock id="salaries" icon="wallet" title={t('company.salariesTitle')}>
                {t('company.salariesBody')}
              </SoonBlock>
              <SoonBlock id="reviews" icon="award" title={t('company.reviewsTitle')}>
                {t('company.reviewsBody')}
              </SoonBlock>
            </div>
          </CareersEvaluation>
        </DetailSection>
      )}
    </DetailLayout>
  )
}

/**
 * What the company is and does, the facts a source confirms, its people, its programmes for young people and
 * where vacancies will go.
 */
function General({ company }: { company: Company }) {
  const { t } = useTranslation()
  const factSources = [company.founded?.source, company.employees?.source].filter(
    (source, index, all): source is SourceLink =>
      source !== undefined && all.findIndex((other) => other?.url === source.url) === index,
  )
  return (
    <DetailSection id="geral" title={t('company.tab_geral')} icon="eye">
      <p className="max-w-3xl text-sm leading-relaxed font-light text-copy">{company.summary}</p>
      {company.activities && company.activities.length > 0 && (
        <div className="mt-8">
          <Subheading>{t('company.activitiesTitle')}</Subheading>
          <ul className="flex flex-wrap gap-1.5">
            {company.activities.map((activity) => (
              <li key={activity}>
                <Chip>{activity}</Chip>
              </li>
            ))}
          </ul>
          {company.activitiesSource && <SourceLine source={company.activitiesSource} />}
        </div>
      )}
      <div className="mt-8">
        <StatBlock items={facts(company, t)} />
        {factSources.map((source) => (
          <SourceLine key={source.url} source={source} />
        ))}
      </div>
      <People people={company.people ?? []} />
      {company.programs.length > 0 && (
        <div className="mt-10">
          <Subheading>{t('company.programsTitle')}</Subheading>
          <ul className="space-y-5">
            {company.programs.map((program) => (
              <li key={program.name}>
                <h3 className="text-base font-bold text-night">{program.name}</h3>
                <p className="mt-1 text-sm font-light text-copy">{program.summary}</p>
                <p className="mt-1 text-xs font-light text-muted">
                  {t('company.source')}:{' '}
                  <ExternalLink href={program.source.url}>{program.source.label}</ExternalLink>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <InternshipsOfCompany companyId={company.id} className="mt-10" />
      <div className="mt-10">
        <SoonBlock id="jobs" icon="megaphone" title={t('company.jobsTitle')}>
          {t('company.jobsBody')}
        </SoonBlock>
      </div>
    </DetailSection>
  )
}

function facts(company: Company, t: TFunction) {
  return [
    { label: t('company.sector'), value: t(`companies.sector_${company.sector}`) },
    { label: t('company.place'), value: company.place },
    { label: t('company.province'), value: company.province },
    ...(company.founded ? [{ label: t('company.founded'), value: company.founded.value }] : []),
    ...(company.employees ? [{ label: t('company.employees'), value: company.employees.value }] : []),
    { label: t('company.statCareers'), value: String(company.careers.length) },
  ]
}

/** Where a fact was published, in small print. */
function SourceLine({ source }: { source: SourceLink }) {
  const { t } = useTranslation()
  return (
    <p className="mt-2 text-xs font-light text-muted">
      {t('company.source')}: <ExternalLink href={source.url}>{source.label}</ExternalLink>
    </p>
  )
}

/** Its leadership and public spokespeople: initials (or a free-licence photo), the post, their own profile and the source. */
function People({ people }: { people: CompanyPerson[] }) {
  const { t } = useTranslation()
  if (people.length === 0) return null
  return (
    <div className="mt-10">
      <Subheading>{t('company.peopleTitle')}</Subheading>
      <ul className="grid gap-3 sm:grid-cols-2">
        {people.map((item) => (
          <li key={item.name} className="flex gap-3 rounded-2xl border border-line p-4">
            {item.photo ? (
              <img src={item.photo} alt="" className="size-12 shrink-0 rounded-full object-cover" />
            ) : (
              <InstitutionLogo institution={{ name: item.name }} />
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-night">{item.name}</h3>
              <p className="text-xs font-light text-copy">{item.role}</p>
              {item.profile && (
                <a
                  href={item.profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('company.personProfile', { name: item.name })}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-coal px-3 py-1 text-xs font-normal text-white hover:bg-night"
                >
                  {t('company.seeLinkedIn')}
                  <Icon name="external" className="size-3.5" />
                </a>
              )}
              <SourceLine source={item.source} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs font-light text-muted">{t('company.peopleNote')}</p>
    </div>
  )
}

/** The company's news, newest first. */
function CompanyNews({ id }: { id: string }) {
  const { t, i18n } = useTranslation()
  const { data: news = [], isPending } = useNews()
  const { forMe } = useNewsForMe()
  const date = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })
  const mine = news
    .filter((item) => item.companies?.includes(id))
    .toSorted((a, b) => b.date.localeCompare(a.date))
  return (
    <DetailSection id="noticias" title={t('company.tab_noticias')} icon="newspaper">
      {isPending ? (
        <Loading>
          <RowsSkeleton />
        </Loading>
      ) : mine.length === 0 ? (
        <p className="text-sm font-light text-muted">{t('company.newsNone')}</p>
      ) : (
        <ul className="space-y-3">
          {mine.map((item) => (
            <li key={item.id}>
              <NewsCard
                item={item}
                date={date.format(new Date(item.date))}
                forYou={forMe(item)}
                href={`/novidades/${item.id}`}
              />
            </li>
          ))}
        </ul>
      )}
    </DetailSection>
  )
}

/** The posts it hires for: title, the careers they lead to and the ad, or our reading. */
function Roles({ company, careers }: { company: Company; careers: CareerSummary[] }) {
  const { t } = useTranslation()
  const roles = companyRoles(company, careers)
  const name = (slug: string) => careers.find((career) => career.slug === slug)?.name
  if (roles.length === 0) return null
  return (
    <div className="mb-10">
      <Subheading>{t('company.rolesTitle')}</Subheading>
      <ul className="grid gap-3 sm:grid-cols-2">
        {roles.map((item) => (
          <li key={item.title} className="rounded-2xl border border-line p-4">
            <h3 className="text-sm font-semibold text-night">{item.title}</h3>
            <p className="mt-1 flex flex-wrap gap-x-2 text-xs font-light">
              {item.careers.map((slug) => (
                <Link key={slug} to={`/carreiras/${slug}`} className="text-night underline hover:text-blue">
                  {name(slug) ?? slug}
                </Link>
              ))}
            </p>
            {item.source ? (
              <SourceLine source={item.source} />
            ) : (
              <p className="mt-2 text-xs font-light text-muted">
                {company.careersSourced ? t('company.roleSourced') : t('company.roleOurs')}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The careers it hires for, filtered by area and demand, a page at a time; one opens what it takes here. */
function Careers({ company, careers }: { company: Company; careers: CareerSummary[] }) {
  const { t } = useTranslation()
  const [params, setParam] = useUrlFilters()
  const [group, setGroup] = useState('')
  const [demand, setDemand] = useState('')
  const open = careers.find((career) => career.slug === params.get('profissao'))
  const groups = [...new Set(careers.map((career) => career.group))]
  const rows = careers.filter(
    (career) => (!group || career.group === group) && (!demand || career.demand === demand),
  )

  return (
    <DetailSection id="profissoes" title={t('company.tab_profissoes')} icon="briefcase">
      <p className="-mt-2 mb-6 text-sm font-light text-copy">
        {company.careersSourced ? t('company.careersSourced') : t('company.careersEditorial')}{' '}
        {t('company.careersHint')}
      </p>
      <Roles company={company} careers={careers} />
      <FilteredGrid
        filters={[
          {
            key: 'group',
            label: t('company.filterArea'),
            placeholder: t('company.anyArea'),
            value: group,
            options: groups.map((item) => ({ value: item, label: t(`groups.${item}`) })),
            onChange: setGroup,
          },
          {
            key: 'demand',
            label: t('company.filterDemand'),
            placeholder: t('company.anyDemand'),
            value: demand,
            options: DEMANDS.map((item) => ({ value: item, label: t(`demand.${item}`) })),
            onChange: setDemand,
          },
        ]}
        items={rows}
        itemKey={(career) => career.slug}
        empty={t('company.careersNone')}
        pagesLabel={t('company.careersPages')}
        renderItem={(career) => (
          <CareerTile
            career={career}
            shown={career === open}
            onOpen={() => setParam('profissao', career.slug)}
          />
        )}
      />
      {open && <NeedsDialog company={company} career={open} onClose={() => setParam('profissao', null)} />}
    </DetailSection>
  )
}

type CareerTileProps = { career: CareerSummary; shown: boolean; onOpen: () => void }

/** One career: area, name, demand, and the way to what it takes at this company. */
function CareerTile({ career, shown, onOpen }: CareerTileProps) {
  const { t } = useTranslation()
  return (
    <article
      aria-label={career.name}
      className={`relative flex h-full flex-col rounded-card border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-card ${shown ? 'ring-2 ring-night' : ''}`}
    >
      <p className="flex items-center gap-2 text-xs font-light text-muted">
        <Icon name={GROUP_ICONS[career.group]} className="size-4" />
        {t(`groups.${career.group}`)}
      </p>
      <h3 className="mt-1 font-display text-base font-bold break-words text-night">
        <button
          type="button"
          onClick={onOpen}
          aria-label={t('company.needsOpen', { career: career.name })}
          className="text-left after:absolute after:inset-0"
        >
          {career.name}
        </button>
      </h3>
      <div className="mt-auto flex items-end justify-between gap-4 pt-4">
        <span className="text-xs font-normal text-blue">{t('company.needsCta')}</span>
        <DemandMeter demand={career.demand} />
      </div>
    </article>
  )
}

/** Where the company published a requirement. */
function PublishedBy({ source }: { source: SourceLink }) {
  const { t } = useTranslation()
  return (
    <p className="mt-1 text-xs font-light text-muted">
      {t('company.needsPublished')}{' '}
      <a href={source.url} target="_blank" rel="noreferrer" className="underline">
        {source.label}
      </a>
    </p>
  )
}

type NeedsDialogProps = { company: Company; career: CareerSummary; onClose: () => void }

/** "What you need to work as B at X": skills, education, experience and how they hire, estimated. */
function NeedsDialog({ company, career, onClose }: NeedsDialogProps) {
  const { t } = useTranslation()
  const { data: detail, isPending } = useCareer(career.slug)
  const needs = detail ? companyNeeds(company, detail) : null
  return (
    <Dialog
      open
      onClose={onClose}
      title={t('company.needsTitle', { career: career.name, company: company.name })}
      footer={
        <ButtonLink to={`/carreiras/${career.slug}`} className="w-full justify-center">
          {t('company.seeCareer')}
        </ButtonLink>
      }
    >
      {isPending ? (
        <Loading>
          <RowsSkeleton />
        </Loading>
      ) : needs ? (
        <>
          <p className="text-xs font-light text-muted">
            {t(
              needs.published.experience || needs.published.hiring
                ? 'company.needsPartlyPublished'
                : 'company.needsEstimated',
            )}
          </p>
          <h3 className="mt-5 mb-2 text-sm font-bold text-night">{t('company.needsSkills')}</h3>
          <div className="flex flex-wrap gap-1.5">
            {needs.skills.map((skill) => (
              <Chip key={skill}>{skill}</Chip>
            ))}
          </div>
          <h3 className="mt-5 mb-2 text-sm font-bold text-night">{t('company.needsEducation')}</h3>
          <p className="text-sm font-light text-copy">
            {needs.education
              ? `${t(`education.${needs.education.level}`)}: ${needs.education.title}`
              : t('company.needsEducationNone')}
          </p>
          {needs.certifications.length > 0 && (
            <p className="mt-1 text-sm font-light text-copy">
              {t('company.needsCerts', { list: needs.certifications.join(', ') })}
            </p>
          )}
          <h3 className="mt-5 mb-2 text-sm font-bold text-night">{t('company.needsExperience')}</h3>
          <p className="text-sm font-light text-copy">
            {needs.experienceYears === 0
              ? company.programs.length > 0
                ? t('company.needsExperienceProgramme')
                : t('company.needsExperienceNone')
              : t('company.needsExperienceYears', { count: needs.experienceYears })}
          </p>
          {needs.duty && (
            <p className="mt-1 text-sm font-light text-copy">
              {t('company.needsDuty', { duty: needs.duty })}
            </p>
          )}
          {needs.published.experience && <PublishedBy source={needs.published.experience} />}
          <h3 className="mt-5 mb-2 text-sm font-bold text-night">{t('company.needsHiring')}</h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm font-light text-copy">
            {needs.hiring.map((step) => (
              <li key={step}>{t(`company.hiring_${step}`)}</li>
            ))}
          </ol>
          {needs.published.hiring && <PublishedBy source={needs.published.hiring} />}
        </>
      ) : (
        <p className="text-sm font-light text-copy">{t('company.needsNone')}</p>
      )}
    </Dialog>
  )
}
