import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { AppLoading } from '../components/AppLoading'
import { RequireProfile } from '../components/RequireProfile'
import HomePage from '../features/home/HomePage'
import type { SoonSection } from '../features/soon/SoonPage'
import { Layout, type RouteHandle } from './Layout'

type PageModule = { default: ComponentType }

/** Each screen downloads its code the first time it is opened. */
const page = (load: () => Promise<PageModule>) => () =>
  load().then((module) => ({ Component: module.default }))

/** Sections that wait for their data get a designed "coming soon". */
const soon = (section: SoonSection) => () =>
  import('../features/soon/SoonPage').then(({ default: SoonPage }) => ({
    Component: () => <SoonPage section={section} />,
  }))

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
        handle: { hideDemoBanner: true, wide: true } satisfies RouteHandle,
        lazy: page(() => import('../features/careers/CareersPage')),
      },
      {
        path: 'carreiras/:slug',
        handle: { hideDemoBanner: true, wide: true } satisfies RouteHandle,
        lazy: page(() => import('../features/careers/CareerPage')),
      },
      {
        path: 'cursos',
        handle: { hideDemoBanner: true, wide: true } satisfies RouteHandle,
        lazy: page(() => import('../features/training/TrainingPage')),
      },
      { path: 'cursos/comparar', lazy: page(() => import('../features/training/ComparePage')) },
      { path: 'pesquisa', lazy: soon('search') },
      { path: 'academias', lazy: soon('academies') },
      { path: 'empresas', lazy: soon('companies') },
      { path: 'mercado', lazy: soon('market') },
      { path: 'novidades', lazy: soon('news') },
      { path: 'notificacoes', lazy: soon('notifications') },
      { path: 'suporte', lazy: soon('support') },
      { path: 'configuracoes', lazy: soon('settings') },
      { path: 'cv', lazy: page(() => import('../features/cv/CvPage')) },
      { path: 'cv/modelos/:id', lazy: page(() => import('../features/cv/CvExamplePage')) },
      { path: 'cv/editar', lazy: withProfile(() => import('../features/cv/CvEditorPage')) },
      { path: 'perfil', lazy: page(() => import('../features/profile/ProfilePage')) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
