import { useTranslation } from 'react-i18next'
import { Subheading } from '../../components/DetailLayout'
import { Icon } from '../../components/icons'
import { Card } from '../../components/ui/Card'
import { useCareers } from '../../data/queries'
import { VIDEO_STORIES } from '../../data/demo/videoStories'
import type { VideoStory } from '../../data/types'

// Covers only from the app's own files: nothing loads from YouTube or TikTok until the person taps.
const COVERS = import.meta.glob<string>('../../assets/videos/*.{webp,jpg,jpeg,png}', {
  eager: true,
  import: 'default',
})

const PLATFORM_NAMES: Record<VideoStory['platform'], string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
}

/** Newest first. */
const byRecorded = (a: VideoStory, b: VideoStory) => b.recordedAt.localeCompare(a.recordedAt)

/** About 1 Mbit/s at the platforms' lowest quality on mobile data. */
const estimatedMb = (seconds: number) => Math.max(1, Math.ceil(seconds / 8))

function duration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function VideoCard({ story, career }: { story: VideoStory; career?: string }) {
  const { t } = useTranslation()
  const cover = story.thumbnail ? COVERS[`../../assets/videos/${story.thumbnail}`] : undefined
  const platform = PLATFORM_NAMES[story.platform]
  const who = [story.role, story.company].filter(Boolean).join(' · ')

  return (
    <Card className="flex h-full flex-col gap-3 p-4">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-coal">
        {cover && <img src={cover} alt="" decoding="async" className="size-full object-cover" />}
        <span className="absolute right-2 bottom-2 rounded-full bg-coal/85 px-2 py-0.5 text-xs text-white tabular-nums">
          <span className="sr-only">{t('videos.durationLabel')} </span>
          {duration(story.durationSeconds)}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 m-auto grid size-12 place-items-center rounded-full bg-white/90 text-night"
        >
          <Icon name="play" className="size-5 fill-night" />
        </span>
      </div>
      <div className="min-w-0">
        {career && <p className="text-xs font-light text-muted">{career}</p>}
        <h3 className="text-base font-semibold text-night">{story.title}</h3>
        <p className="mt-0.5 text-sm font-light text-copy">
          <span className="font-normal text-night">{story.name}</span>
          {who && ` · ${who}`}
        </p>
      </div>
      <div className="mt-auto">
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-night px-4 py-2 text-sm font-normal text-white hover:bg-coal"
        >
          <Icon name="play" className="size-4" />
          {t('videos.watch')}
          <span className="sr-only">{t('videos.opensIn', { platform })}</span>
          <Icon name="external" className="size-4" />
        </a>
        <p className="mt-2 flex items-start gap-1.5 text-xs font-light text-muted">
          <Icon name="signal" className="mt-0.5 size-3.5 shrink-0" />
          {t('videos.dataWarning', { platform, mb: estimatedMb(story.durationSeconds) })}
        </p>
      </div>
    </Card>
  )
}

/** On the career page: "O meu dia como…", only when there is at least one video. */
export function CareerVideos({ careerSlug, careerName }: { careerSlug: string; careerName: string }) {
  const { t } = useTranslation()
  const stories = VIDEO_STORIES.filter((story) => story.careerSlug === careerSlug).toSorted(byRecorded)
  if (stories.length === 0) return null
  return (
    <div className="mt-10">
      <Subheading>{t('videos.careerTitle', { career: careerName })}</Subheading>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stories.map((story) => (
          <li key={story.id}>
            <VideoCard story={story} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** On the home and in Novidades: the three newest videos, when there are any. */
export function NewStories({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const { data: careers = [] } = useCareers()
  if (VIDEO_STORIES.length === 0) return null
  const careerName = (slug: string) => careers.find((career) => career.slug === slug)?.name
  const newest = VIDEO_STORIES.toSorted(byRecorded).slice(0, 3)
  return (
    <Card as="section" aria-labelledby="new-stories" className={`p-5 ${className}`}>
      <h2 id="new-stories" className="flex items-center gap-3 text-base font-semibold text-night">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue text-white">
          <Icon name="play" className="size-4" />
        </span>
        {t('videos.newTitle')}
      </h2>
      <p className="mt-1 text-sm font-light text-copy">{t('videos.newBody')}</p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {newest.map((story) => (
          <li key={story.id}>
            <VideoCard story={story} career={careerName(story.careerSlug)} />
          </li>
        ))}
      </ul>
    </Card>
  )
}
