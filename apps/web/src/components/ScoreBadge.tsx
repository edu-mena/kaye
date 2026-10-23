import { useTranslation } from 'react-i18next'

/** The Kayé score of a course, 0–100, with its name always next to the number. */
export function ScoreBadge({ score }: { score: number }) {
  const { t } = useTranslation()

  return (
    <span className="inline-flex shrink-0 flex-col items-center rounded-2xl bg-navy px-3 py-1.5 text-white">
      <span className="font-display text-xl leading-none font-bold">{score}</span>
      <span className="text-[0.65rem] font-semibold text-white/80">{t('training.score')}</span>
    </span>
  )
}
