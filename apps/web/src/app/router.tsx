import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { AppLoading } from '../components/AppLoading'
import { RequireProfile } from '../components/RequireProfile'
import HomePage from '../features/home/HomePage'
import { Layout, type RouteHandle } from './Layout'

type PageModule = { default: ComponentType }

/** Each screen downloads its code the first time it is opened. */
const page = (load: () => Promise<PageModule>) => () =>
  load().then((module) => ({ Component: module.default }))

/** Screens that need a profile (later: an account) send the person to /entrar first. */
const withProfile = (load: () => Promise<PageModule>) => () =>
  load().then(({ default: Screen }) => ({
    Component: () => (
      <RequireProfile>
        <Screen />
      </RequireProfile>
    ),
  }))

export const router = createBrowserRouter([
  {
    Component: Layout,
    // Shown while a screen's code downloads on the first visit (deep links, slow networks).
    HydrateFallback: AppLoading,
    children: [
      { index: true, Component: HomePage },
      { path: 'entrar', lazy: page(() => import('../features/onboarding/OnboardingPage')) },
      { path: 'teste', lazy: withProfile(() => import('../features/assessment/AssessmentPage')) },
      { path: 'teste/resultado', lazy: page(() => import('../features/assessment/ResultPage')) },
      {
        path: 'carreiras',
        handle: { wide: true } satisfies RouteHandle,
        lazy: page(() => import('../features/careers/CareersPage')),
      },
      {
        path: 'carreiras/:slug',
        handle: { wide: true } satisfies RouteHandle,
        lazy: page(() => import('../features/careers/CareerPage')),
      },
      {
        path: 'cursos',
        handle: { wide: true } satisfies RouteHandle,
        lazy: page(() => import('../features/training/TrainingPage')),
      },
      { path: 'cursos/comparar', lazy: page(() => import('../features/training/ComparePage')) },
      {
        path: 'cursos/:id',
        handle: { wide: true } satisfies RouteHandle,
        lazy: page(() => import('../features/training/CoursePage')),
      },
      { path: 'pesquisa', lazy: page(() => import('../features/search/SearchPage')) },
      {
        path: 'academias',
        handle: { wide: true } satisfies RouteHandle,
        lazy: page(() => import('../features/academies/AcademiesPage')),
      },
      {
        path: 'academias/:id',
        handle: { wide: true } satisfies RouteHandle,
        lazy: page(() => import('../features/academies/AcademyPage')),
      },
      {
        path: 'empresas',
        handle: { wide: true } satisfies RouteHandle,
        lazy: page(() => import('../features/companies/CompaniesPage')),
      },
      {
        path: 'empresas/:id',
        handle: { wide: true } satisfies RouteHandle,
        lazy: page(() => import('../features/companies/CompanyPage')),
      },
      {
        path: 'mercado',
        handle: { wide: true } satisfies RouteHandle,
        lazy: page(() => import('../features/market/MarketPage')),
      },
      { path: 'novidades', lazy: page(() => import('../features/news/NewsPage')) },
      { path: 'notificacoes', lazy: page(() => import('../features/notifications/NotificationsPage')) },
      { path: 'suporte', lazy: page(() => import('../features/support/SupportPage')) },
      { path: 'configuracoes', lazy: page(() => import('../features/settings/SettingsPage')) },
      { path: 'termos', lazy: page(() => import('../features/legal/TermsPage')) },
      { path: 'privacidade', lazy: page(() => import('../features/legal/PrivacyPage')) },
      { path: 'cv', lazy: page(() => import('../features/cv/CvPage')) },
      { path: 'cv/modelos/:id', lazy: page(() => import('../features/cv/CvExamplePage')) },
      { path: 'cv/editar', lazy: withProfile(() => import('../features/cv/CvEditorPage')) },
      {
        path: 'perfil',
        handle: { wide: true } satisfies RouteHandle,
        lazy: page(() => import('../features/profile/ProfilePage')),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
