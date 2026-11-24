import { topicExam } from '../topicCourse'
import type { UnitContent } from '../types'

// The final exam's bank: the three questions of each written topic's review. It grows by itself with each topic file.

const TOPIC_FILES = import.meta.glob<{ default: UnitContent }>('./t[0-9][0-9].ts')

export default () => topicExam(TOPIC_FILES)
