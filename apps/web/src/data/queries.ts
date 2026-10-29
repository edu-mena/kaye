import { useQuery } from '@tanstack/react-query'
import {
  getAcademy,
  getAssessment,
  getCareer,
  getCompany,
  getEducation,
  getEmployment,
  getJobMarket,
  listAcademies,
  listCareers,
  listCompanies,
  listCvExamples,
  listNews,
  listPrograms,
} from './source'

// One hook per resource, so screens never call the data source directly.

export function useCareers() {
  return useQuery({ queryKey: ['careers'], queryFn: listCareers })
}

export function useCareer(slug: string) {
  return useQuery({ queryKey: ['careers', slug], queryFn: () => getCareer(slug) })
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

export function useCompanies() {
  return useQuery({ queryKey: ['companies'], queryFn: listCompanies })
}

export function useCompany(id: string) {
  return useQuery({ queryKey: ['companies', id], queryFn: () => getCompany(id) })
}

export function useAssessment() {
  return useQuery({ queryKey: ['assessment'], queryFn: getAssessment, staleTime: Infinity })
}

export function useCvExamples(careerSlug?: string) {
  return useQuery({
    queryKey: ['cv-examples', careerSlug ?? 'all'],
    queryFn: () => listCvExamples(careerSlug),
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

/** Careers, courses, academies and companies together (Pesquisa, Mercado): ready when all four are. */
export function useCatalog() {
  const sources = [useCareers(), usePrograms(), useAcademies(), useCompanies()] as const
  const [careers, programs, academies, companies] = sources
  const data =
    careers.data && programs.data && academies.data && companies.data
      ? {
          careers: careers.data,
          programs: programs.data,
          academies: academies.data,
          companies: companies.data,
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
