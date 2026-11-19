import { useTranslation } from 'react-i18next'
import { KURSOS } from '../../data/kursos'
import { useCareers, useSkills } from '../../data/queries'
import type { CvData, CvDocument } from '../../data/types'
import { cvSuggestions, type CvSuggestion } from '../../domain/cvFill'
import { isMinor } from '../../domain/education'
import { DIGITAL_SKILLS, experienceEntries } from '../../domain/strengths'
import { useUser } from '../../state/userStore'

/** What the app already knows that fits this CV, in the person's language. */
export function useCvSuggestions(cv: CvData, target?: CvDocument['target']): CvSuggestion[] {
  const { t } = useTranslation()
  const user = useUser()
  const { data: careers = [] } = useCareers()
  const { data: catalogue = [] } = useSkills()
  const { profile, discovery, strengths } = user

  const slug = target?.career ?? user.targetCareer ?? user.savedCareers[0]
  const career = careers.find((item) => item.slug === slug)?.name ?? null
  const area = target?.area ?? discovery?.areas[0] ?? null
  const situation = discovery?.situation

  const objective = () => {
    if (career) {
      const text = situation
        ? t(`cv.fillObjective_${situation}`, { career })
        : t('cv.fillObjective', { career })
      return { text, source: situation ? ('guide' as const) : ('target' as const) }
    }
    return area
      ? { text: t('cv.fillObjectiveArea', { area: t(`market.area_${area}`) }), source: 'guide' as const }
      : null
  }

  // Best known first: what the person masters leads the list.
  const known = catalogue.filter(({ id }) => user.skills[id] === 'sei' || user.skills[id] === 'domino')
  const digital = DIGITAL_SKILLS.filter(
    (id) => strengths.digital[id] === 'sei' || strengths.digital[id] === 'domino',
  )
  const skills = [
    ...known.filter(({ id }) => user.skills[id] === 'domino').map((skill) => skill.name),
    ...known.filter(({ id }) => user.skills[id] === 'sei').map((skill) => skill.name),
    ...digital.map((id) => t(`strengths.digital_${id}`)),
    // Soft skills stay private unless the person chose them for the CV.
    ...strengths.softInCv.map((id) => t(`strengths.soft_${id}`)),
  ]
  const languages = strengths.languages.map((language) =>
    t('strengths.cvLanguage', {
      name: language.id === 'other' ? (language.name ?? '') : t(`strengths.language_${language.id}`),
      level: t(`strengths.cvLevel_${language.level}`),
    }),
  )
  const finished = KURSOS.flatMap((course) => {
    const progress = user.kursos[course.id]
    return progress?.completedAt && progress.certificate
      ? [{ title: course.title, certificate: progress.certificate, year: progress.completedAt.slice(0, 4) }]
      : []
  })

  return cvSuggestions({
    cv,
    minor: profile ? isMinor(profile.birthYear) : true,
    name: profile?.name ?? null,
    location: profile?.province ?? null,
    education: profile ? t(`education.${profile.education}`) : null,
    headline: career,
    objective: objective(),
    skills: [...new Set(skills)],
    languages: languages.filter((language) => !language.startsWith(' (')),
    entries: experienceEntries(strengths.experience, finished, (code) =>
      t('strengths.cvCertificate', { code }),
    ),
  })
}
