import { useQueries, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { LOCALES, type Locale } from '../lib/i18n'
import {
  getAcademy,
  getCourse,
  getAssessment,
  getCareer,
  getCompany,
  getEducation,
  getEmployment,
  getJobMarket,
  listAcademies,
  listAdmissions,
  listCareerTraits,
  listCourses,
  getPublicCard,
  listCareers,
  listSkills,
  listCompanies,
  listCvExamples,
  listFigures,
  listNews,
  listFreeCourses,
  listInternships,
  listScholarships,
  listSupportPrograms,
  listPrograms,
  listTestimonials,
} from './source'

// One hook per resource, so screens never call the data source directly.

export function useCareers() {
  return useQuery({ queryKey: ['careers'], queryFn: listCareers })
}

export function useCareer(slug: string) {
  return useQuery({ queryKey: ['careers', slug], queryFn: () => getCareer(slug) })
}

/** Several careers in full (a course's), sharing the cache of each career page; the curated ones only. */
export function useCareerDetails(slugs: string[]) {
  return useQueries({
    queries: slugs.map((slug) => ({ queryKey: ['careers', slug], queryFn: () => getCareer(slug) })),
    combine: (results) => ({
      data: results.flatMap((result) => (result.data ? [result.data] : [])),
      isPending: results.some((result) => result.isPending),
    }),
  })
}

export function usePublicCard(slug: string) {
  return useQuery({ queryKey: ['public-card', slug], queryFn: () => getPublicCard(slug) })
}

export function useSkills() {
  return useQuery({ queryKey: ['skills'], queryFn: listSkills })
}

export function usePrograms(careerSlug?: string) {
  return useQuery({ queryKey: ['programs', careerSlug ?? 'all'], queryFn: () => listPrograms(careerSlug) })
}

export function useAcademies() {
  return useQuery({ queryKey: ['academies'], queryFn: listAcademies })
}

export function useAcademy(id: string) {
  return useQuery({ queryKey: ['academies', id], queryFn: () => getAcademy(id) })
}

export function useCourses() {
  return useQuery({ queryKey: ['courses'], queryFn: listCourses })
}

export function useCourse(id: string) {
  return useQuery({ queryKey: ['courses', id], queryFn: () => getCourse(id) })
}

export function useCompanies() {
  return useQuery({ queryKey: ['companies'], queryFn: listCompanies })
}

export function useCompany(id: string) {
  return useQuery({ queryKey: ['companies', id], queryFn: () => getCompany(id) })
}

/** The statements in the language on screen: changing it fetches them again. */
export function useAssessment() {
  const { i18n } = useTranslation()
  const locale = (LOCALES as readonly string[]).includes(i18n.language) ? (i18n.language as Locale) : 'pt'
  return useQuery({
    queryKey: ['assessment', locale],
    queryFn: () => getAssessment(locale),
    staleTime: Infinity,
  })
}

export function useCareerTraits() {
  return useQuery({ queryKey: ['careerTraits'], queryFn: listCareerTraits, staleTime: Infinity })
}

export function useCvExamples(careerSlug?: string) {
  return useQuery({
    queryKey: ['cv-examples', careerSlug ?? 'all'],
    queryFn: () => listCvExamples(careerSlug),
  })
}

export function useTestimonials(careerSlug?: string) {
  return useQuery({
    queryKey: ['testimonials', careerSlug ?? 'all'],
    queryFn: () => listTestimonials(careerSlug),
  })
}

export function useJobMarket() {
  return useQuery({ queryKey: ['market', 'jobs'], queryFn: getJobMarket })
}

export function useEducation() {
  return useQuery({ queryKey: ['market', 'education'], queryFn: getEducation })
}

export function useEmployment() {
  return useQuery({ queryKey: ['market', 'employment'], queryFn: getEmployment })
}

export function useNews() {
  return useQuery({ queryKey: ['news'], queryFn: listNews })
}

export function useScholarships() {
  return useQuery({ queryKey: ['scholarships'], queryFn: listScholarships })
}

export function useFreeCourses(careerSlug?: string) {
  return useQuery({
    queryKey: ['free-courses', careerSlug ?? 'all'],
    queryFn: () => listFreeCourses(careerSlug),
  })
}

export function useInternships() {
  return useQuery({ queryKey: ['internships'], queryFn: listInternships })
}

export function useSupportPrograms() {
  return useQuery({ queryKey: ['support-programs'], queryFn: listSupportPrograms })
}

export function useAdmissions() {
  return useQuery({ queryKey: ['admissions'], queryFn: listAdmissions })
}

export function useFigures() {
  return useQuery({ queryKey: ['figures'], queryFn: listFigures })
}

/** Careers, courses, academies and companies together (Pesquisa, Mercado): ready when all four are. */
export function useCatalog() {
  const sources = [
    useCareers(),
    usePrograms(),
    useAcademies(),
    useCompanies(),
    useScholarships(),
    useInternships(),
  ] as const
  const [careers, programs, academies, companies, scholarships, internships] = sources
  const data =
    careers.data && programs.data && academies.data && companies.data && scholarships.data && internships.data
      ? {
          careers: careers.data,
          programs: programs.data,
          academies: academies.data,
          companies: companies.data,
          scholarships: scholarships.data,
          internships: internships.data,
        }
      : undefined
  return {
    data,
    isError: sources.some((source) => source.isError),
    retry: () => {
      for (const source of sources) if (source.isError) void source.refetch()
    },
  }
}
