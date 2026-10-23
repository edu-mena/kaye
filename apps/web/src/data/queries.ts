import { useQuery } from '@tanstack/react-query'
import { getAssessment, getCareer, listCareers, listCvExamples, listPrograms } from './source'

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

export function useAssessment() {
  return useQuery({ queryKey: ['assessment'], queryFn: getAssessment, staleTime: Infinity })
}

export function useCvExamples(careerSlug?: string) {
  return useQuery({
    queryKey: ['cv-examples', careerSlug ?? 'all'],
    queryFn: () => listCvExamples(careerSlug),
  })
}
