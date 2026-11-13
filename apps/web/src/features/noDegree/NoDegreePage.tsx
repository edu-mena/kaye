import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { AreaPicker } from '../../components/AreaPicker'
import { DetailLayout, DetailSection, Subheading } from '../../components/DetailLayout'
import { ExternalLink } from '../../components/DetailParts'
import { EntityCard } from '../../components/EntityCard'
import { FilteredGrid } from '../../components/FilteredGrid'
import { GROUP_ICONS } from '../../components/groupIcons'
import { Icon } from '../../components/icons'
import { PathMark } from '../../components/PathMark'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { useAcademies, useCareerDetails, useCareerTraits, useSupportPrograms } from '../../data/queries'
import type { Career, CareerGroup } from '../../data/types'
import { remainingSteps } from '../../domain/education'
import { formatKz } from '../../domain/format'
import { useDuration } from '../../lib/useFormat'
import { useUrlFilters } from '../../lib/useUrlFilters'
import { useUser } from '../../state/userStore'
import { academyMeta } from '../academies/labels'
import { FORMAL_STEPS, OWN_STEPS } from './sources'

const TABS = [
  { id: 'oficios', icon: 'briefcase' },
  { id: 'onde', icon: 'landmark' },
  { id: 'conta-propria', icon: 'wallet' },
  { id: 'formal', icon: 'document' },
] as const

type TabId = (typeof TABS)[number]['id']

/**
 * Sem universidade (/sem-universidade): for who will not, or cannot yet, go to university. Trades, where to learn
 * them, working on one's own and leaving the informal economy, each in short steps with a source.
 */
export default function NoDegreePage() {
  const { t } = useTranslation()
  const [params, setParam] = useUrlFilters()
  const active = TABS.find((tab) => tab.id === params.get('secao'))?.id ?? 'oficios'

  return (
    <DetailLayout<TabId>
      header={
        <Card tone="coal" data-tour="noDegree" className="relative overflow-hidden p-6 sm:p-10">
          <PathMark className="pointer-events-none absolute -right-10 -bottom-12 w-56 opacity-40 sm:w-80" />
          <div className="relative max-w-2xl">
            <h1 className="text-3xl leading-tight font-extrabold sm:text-4xl">{t('noDegree.title')}</h1>
            <p className="mt-3 text-sm font-light text-white/80">{t('noDegree.body')}</p>
          </div>
        </Card>
      }
      tabs={{
        label: t('noDegree.tabsLabel'),
        items: TABS.map((tab) => ({ id: tab.id, icon: tab.icon, label: t(`noDegree.tab_${tab.id}`) })),
        value: active,
        onChange: (id) => setParam('secao', id === 'oficios' ? null : id),
        idPrefix: 'sem-universidade',
      }}
    >
      {active === 'oficios' && <Trades />}
      {active === 'onde' && <WhereToLearn />}
      {active === 'conta-propria' && <OwnBusiness />}
      {active === 'formal' && <Formal />}
    </DetailLayout>
  )
}

/** The path that asks the least schooling: its length and its cost. */
function shortest(career: Career) {
  return (
    career.pathways
      .map((pathway) => ({ pathway, ...remainingSteps(pathway, null) }))
      .filter(
        ({ steps }) => !steps.some((step) => step.kind === 'academico' && step.level === 'licenciatura'),
      )
      .toSorted((a, b) => a.months.min - b.months.min)[0] ?? null
  )
}

function Trades() {
  const { t } = useTranslation()
  const duration = useDuration()
  const { data: traits = [] } = useCareerTraits()
  const slugs = traits.filter((item) => item.entry?.level === 'short').map((item) => item.slug)
  const { data: careers } = useCareerDetails(slugs)
  const [group, setGroup] = useState<CareerGroup | null>(null)
  const groups = [...new Set(careers.map((career) => career.group))]
  const shown = careers
    .filter((career) => group === null || career.group === group)
    .toSorted((a, b) => a.name.localeCompare(b.name))

  return (
    <DetailSection id="oficios" title={t('noDegree.tab_oficios')} icon="briefcase">
      <p className="mb-5 text-sm font-light text-copy">{t('noDegree.tradesBody')}</p>
      <AreaPicker
        className="mb-6"
        label={t('noDegree.areaLabel')}
        allLabel={t('noDegree.anyArea')}
        options={groups.map((item) => ({ value: item, label: t(`groups.${item}`) }))}
        value={group}
        onChange={setGroup}
      />
      <ul className="grid gap-3 sm:grid-cols-2">
        {shown.map((career) => {
          const path = shortest(career)
          const cost = path?.pathway.totalCost
          return (
            <li key={career.slug}>
              <Link
                to={`/carreiras/${career.slug}`}
                className="flex h-full items-start gap-3 rounded-2xl bg-surface p-4 shadow-card transition hover:shadow-lift"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-coal text-gold">
                  <Icon name={GROUP_ICONS[career.group]} className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-night">{career.name}</span>
                  <span className="block text-xs font-light text-muted">{t(`groups.${career.group}`)}</span>
                  {path && (
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      <Chip>
                        <Icon name="clock" className="size-3.5" />
                        {duration(path.months)}
                      </Chip>
                      {cost && (
                        <Chip>
                          <Icon name="wallet" className="size-3.5" />
                          {cost.max === 0
                            ? t('noDegree.costFree')
                            : t('noDegree.cost', { min: formatKz(cost.min), max: formatKz(cost.max) })}
                          {path.pathway.estimated && ` · ${t('noDegree.estimated')}`}
                        </Chip>
                      )}
                    </span>
                  )}
                </span>
                <Icon name="chevronRight" className="mt-1 size-4 shrink-0 text-muted" />
              </Link>
            </li>
          )
        })}
      </ul>
      <Link
        to="/carreiras?entrada=sem-licenciatura"
        className="mt-5 inline-flex items-center gap-1 text-sm font-normal text-night hover:text-blue"
      >
        {t('noDegree.allNoDegree')}
        <Icon name="chevronRight" className="size-3.5" />
      </Link>
    </DetailSection>
  )
}

function WhereToLearn() {
  const { t } = useTranslation()
  const { data: academies = [] } = useAcademies()
  const province = useUser().profile?.province ?? null
  const [where, setWhere] = useState('')
  const [type, setType] = useState('')
  const centres = academies.filter(
    (academy) => academy.type === 'centro_formacao' || academy.type === 'instituto_medio',
  )
  const provinces = [...new Set(centres.map((academy) => academy.province))].toSorted()
  const items = centres
    .filter((academy) => (!where || academy.province === where) && (!type || academy.type === type))
    .toSorted(
      (a, b) =>
        Number(b.province === province) - Number(a.province === province) || a.name.localeCompare(b.name),
    )

  return (
    <DetailSection id="onde" title={t('noDegree.tab_onde')} icon="landmark">
      <p className="mb-5 text-sm font-light text-copy">{t('noDegree.whereBody')}</p>
      <FilteredGrid
        filters={[
          {
            key: 'provincia',
            label: t('noDegree.provinceLabel'),
            placeholder: t('noDegree.anyProvince'),
            value: where,
            options: provinces.map((value) => ({ value, label: value })),
            onChange: setWhere,
          },
          {
            key: 'tipo',
            label: t('noDegree.typeLabel'),
            placeholder: t('noDegree.anyType'),
            value: type,
            options: [
              { value: 'centro_formacao', label: t('noDegree.type_centro_formacao') },
              { value: 'instituto_medio', label: t('noDegree.type_instituto_medio') },
            ],
            onChange: setType,
          },
        ]}
        items={items}
        itemKey={(academy) => academy.id}
        renderItem={(academy) => (
          <EntityCard
            entity={academy}
            to={`/academias/${academy.id}`}
            meta={academyMeta(academy, t)}
            place={academy.place}
            badge={academy.province === province ? t('common.forYou') : undefined}
          />
        )}
        empty={t('noDegree.whereEmpty')}
        pagesLabel={t('noDegree.pages')}
      />
    </DetailSection>
  )
}

type Step = { key: string; source: { label: string; url: string } }

function Steps({ prefix, steps }: { prefix: string; steps: Step[] }) {
  const { t } = useTranslation()
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={step.key} className="flex gap-3 rounded-2xl bg-surface p-4 shadow-card">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue text-sm font-semibold text-white">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-night">
              {t(`noDegree.${prefix}_${step.key}_title` as 'noDegree.own_learn_title')}
            </h3>
            <p className="mt-1 text-sm font-light text-copy">
              {t(`noDegree.${prefix}_${step.key}_body` as 'noDegree.own_learn_body')}
            </p>
            <p className="mt-2 text-xs font-light text-muted">
              {t('opportunity.source')}{' '}
              <ExternalLink href={step.source.url}>{step.source.label}</ExternalLink>
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function OwnBusiness() {
  const { t } = useTranslation()
  const { data: programs = [] } = useSupportPrograms()

  return (
    <DetailSection id="conta-propria" title={t('noDegree.tab_conta-propria')} icon="wallet">
      <p className="mb-5 text-sm font-light text-copy">{t('noDegree.ownBody')}</p>
      <Steps prefix="own" steps={OWN_STEPS} />
      <Subheading className="mt-10">{t('noDegree.programsTitle')}</Subheading>
      <p className="-mt-2 mb-4 text-sm font-light text-copy">{t('noDegree.programsBody')}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {programs.map((program) => (
          <li key={program.id}>
            <Card as="article" className="flex h-full flex-col">
              <Chip>{t(`noDegree.kind_${program.kind}`)}</Chip>
              <h3 className="mt-3 text-base leading-snug font-semibold text-night">{program.name}</h3>
              <p className="mt-1 text-xs font-light text-muted">{program.provider}</p>
              <p className="mt-2 text-sm font-light text-copy">{program.audience}</p>
              <p className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-xs font-light text-muted">
                <ExternalLink href={program.url}>{t('noDegree.open')}</ExternalLink>
                <span>
                  {t('opportunity.source')}{' '}
                  {program.sources.map((source, index) => (
                    <span key={source.url}>
                      {index > 0 && ', '}
                      <ExternalLink href={source.url}>{source.label}</ExternalLink>
                    </span>
                  ))}
                </span>
              </p>
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs font-light text-muted">{t('noDegree.ownNote')}</p>
    </DetailSection>
  )
}

function Formal() {
  const { t } = useTranslation()
  const reasons = ['credit', 'clients', 'protection', 'grow'] as const
  return (
    <DetailSection id="formal" title={t('noDegree.tab_formal')} icon="document">
      <p className="mb-5 text-sm font-light text-copy">{t('noDegree.formalBody')}</p>
      <Subheading>{t('noDegree.whyTitle')}</Subheading>
      <ul className="mb-8 grid gap-2 sm:grid-cols-2">
        {reasons.map((reason) => (
          <li key={reason} className="flex items-start gap-2 text-sm font-light text-copy">
            <Icon name="check" className="mt-0.5 size-4 shrink-0 text-success" />
            {t(`noDegree.why_${reason}`)}
          </li>
        ))}
      </ul>
      <Subheading>{t('noDegree.formalStepsTitle')}</Subheading>
      <Steps prefix="formal" steps={FORMAL_STEPS} />
    </DetailSection>
  )
}
