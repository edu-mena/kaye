import { useTranslation } from 'react-i18next'
import { StatBlock, Subheading } from '../../components/DetailLayout'
import { OpportunityCard } from '../../components/OpportunityCard'
import { Chip } from '../../components/ui/Chip'
import { useSupportPrograms } from '../../data/queries'
import type { SelfEmployment } from '../../data/types'
import { formatKz } from '../../domain/format'

/** "Trabalhar por conta própria": how it is done, what it costs to start, the steps and the real support. */
export function SelfEmploymentPanel({ data }: { data: SelfEmployment }) {
  const { t } = useTranslation()
  const { data: programs = [] } = useSupportPrograms()
  const support = data.programIds.flatMap((id) => programs.filter((program) => program.id === id))

  return (
    <div>
      <Subheading>
        <span className="inline-flex flex-wrap items-center gap-2">
          {t('selfEmployment.title')}
          <Chip tone={data.fit === 'comum' ? 'success' : 'neutral'}>
            {t(`selfEmployment.fit_${data.fit}`)}
          </Chip>
          <Chip>{t('cost.estimate')}</Chip>
        </span>
      </Subheading>
      <p className="max-w-3xl text-sm leading-relaxed font-light text-copy">{data.how}</p>

      {data.startCost && (
        <div className="mt-6">
          <StatBlock
            items={[
              {
                label: t('selfEmployment.startCost'),
                value: t('cost.range', {
                  min: formatKz(data.startCost.min),
                  max: formatKz(data.startCost.max),
                }),
              },
            ]}
          />
        </div>
      )}

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <StepList title={t('selfEmployment.firstSteps')} items={data.firstSteps} />
        <StepList title={t('selfEmployment.formalise')} items={data.formalise} />
      </div>
      <p className="mt-4 text-xs font-light text-muted">{t('selfEmployment.estimatedNote')}</p>

      {support.length > 0 && (
        <>
          <Subheading className="mt-10">{t('selfEmployment.support')}</Subheading>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {support.map((program) => (
              <li key={program.id}>
                <OpportunityCard
                  item={{ ...program, deadline: null, recurring: false }}
                  chips={[t(`selfEmployment.kind_${program.kind}`)]}
                  open={false}
                  openLabel=""
                  showDeadline={false}
                  facts={[
                    {
                      icon: 'users',
                      text:
                        program.minAge === undefined
                          ? program.audience
                          : `${program.audience} · ${t('selfEmployment.minAge', { age: program.minAge })}`,
                    },
                  ]}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function StepList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-3 text-sm font-normal text-night">{title}</p>
      <ol className="space-y-2">
        {items.map((item, index) => (
          <li key={item} className="flex gap-3 text-sm font-light text-copy">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-night text-xs text-white">
              {index + 1}
            </span>
            <span className="pt-0.5">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
