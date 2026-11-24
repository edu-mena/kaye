import type { UnitContent } from '../types'
import { describeBank } from '../bankSuite'
import loadExam from './exam'
import { TOPICS } from './topics'

describeBank(
  'Contabilidade: PGC na Prática',
  import.meta.glob<{ default: UnitContent }>('./t[0-9][0-9].ts'),
  TOPICS,
  loadExam,
)
