// One topic a day on the free account (docs/decisoes/0025). The day counts when the person finishes the topic, not
// when they open it, and it is the person's local day (the same "2026-11-24" the streak uses).

/** A topic (a unit of a Kurso) finished on a local day. */
export type TopicCompletion = { topic: string; day: string }

const FREE_DAILY_TOPICS = 1

/**
 * The limit that applies: only with the Plus flag on and without Plus, for adults and minors alike (minors get no
 * promotion, but keep the same limit). With the flag off nothing closes.
 */
export const dailyLimit = (flagOn: boolean, isPlus: boolean): number =>
  flagOn && !isPlus ? FREE_DAILY_TOPICS : Number.POSITIVE_INFINITY

/** Another topic may be finished today while fewer than `limit` were finished today. */
export const canStartTopic = (
  completions: readonly TopicCompletion[],
  today: string,
  limit: number,
): boolean => completions.filter((entry) => entry.day === today).length < limit

/** The list with `topic` finished on `day`; a topic already in the list keeps its first day. */
export const withCompletion = (
  completions: readonly TopicCompletion[] = [],
  topic: string,
  day: string,
): TopicCompletion[] =>
  completions.some((entry) => entry.topic === topic) ? [...completions] : [...completions, { topic, day }]
