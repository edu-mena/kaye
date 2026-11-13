import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { PageHeader } from '../../components/ui/PageHeader'
import { TabPanel, Tabs, type Tab } from '../../components/ui/Tabs'
import { InternshipsSection } from '../internships/InternshipsSection'
import { ScholarshipsSection } from '../scholarships/ScholarshipsSection'

const OPPORTUNITY_TABS = ['bolsas', 'estagios'] as const
type OpportunityTab = (typeof OPPORTUNITY_TABS)[number]

const ID = 'opportunities'

/** Oportunidades (/oportunidades): scholarships and internships, one tab each; the tab lives in ?tab=. */
export default function OpportunitiesPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const tab = OPPORTUNITY_TABS.find((value) => value === params.get('tab')) ?? 'bolsas'
  const tabs: Tab<OpportunityTab>[] = [
    { id: 'bolsas', label: t('nav.scholarships'), icon: 'award' },
    { id: 'estagios', label: t('nav.internships'), icon: 'briefcase', tour: 'internships' },
  ]

  // Each tab has its own filters: a new tab starts without the other's.
  const change = (next: OpportunityTab) =>
    setParams(new URLSearchParams({ tab: next }), { replace: true, preventScrollReset: true })

  return (
    <>
      <PageHeader compact title={t('nav.opportunities')} subtitle={t('opportunities.subtitle')} />
      <Tabs
        label={t('opportunities.tabsLabel')}
        tabs={tabs}
        value={tab}
        onChange={change}
        idPrefix={ID}
        className="mb-4"
      />
      <TabPanel idPrefix={ID} id={tab} variant="bare">
        <p className="mb-4 text-sm font-light text-copy">
          {t(tab === 'bolsas' ? 'scholarships.subtitle' : 'internships.subtitle')}
        </p>
        {tab === 'bolsas' ? <ScholarshipsSection /> : <InternshipsSection />}
      </TabPanel>
    </>
  )
}
