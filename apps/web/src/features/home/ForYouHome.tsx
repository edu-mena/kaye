import { InstallCard } from '../../components/InstallApp'
import { NewStories } from '../videos/VideoStories'
import { DailyChallenge } from './DailyChallenge'
import { Feed } from './Feed'
import { HeroTile } from './HeroTile'
import { Journey } from './Journey'
import { NewsHighlight } from './NewsHighlight'
import { PlusCard } from '../plus/PlusCard'
import { Streak } from './Streak'

/**
 * The home of who has a profile ("Para ti"). On a phone, one column: hero, streak, challenge, news of the person's
 * area, then the feed and the journey. From `lg`, the feed on the left and a fixed column on the right with the
 * streak, the challenge and the journey.
 */
export function ForYouHome() {
  return (
    <div className="space-y-4">
      <InstallCard />
      <NewStories />
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="contents min-w-0 lg:block lg:space-y-4">
          <div className="order-1">
            <HeroTile />
          </div>
          <div className="order-4 min-w-0 space-y-4">
            <NewsHighlight />
            <Feed />
          </div>
        </div>
        <aside className="contents lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:flex lg:flex-col lg:gap-4">
          <div className="order-2 space-y-4">
            <Streak />
            <DailyChallenge />
          </div>
          <div className="order-5">
            <Journey />
          </div>
          <div className="order-6 hidden lg:block">
            <PlusCard />
          </div>
        </aside>
      </div>
    </div>
  )
}
