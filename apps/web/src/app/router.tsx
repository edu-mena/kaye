import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { AppLoading } from '../components/AppLoading'
import { RequireProfile } from '../components/RequireProfile'
import { IndexPage } from '../features/home/IndexPage'
import { KeepQuery } from './KeepQuery'
import { Layout, type RouteHandle } from './Layout'

type PageModule = { default: ComponentType }

/** Each screen downloads its code the first time it is opened. */
const publicPage = (load: () => Promise<PageModule>) => () =>
  load().then((module) => ({ Component: module.default }))

/** Exploring needs no account (docs/decisoes/0021): these screens open for everyone. */
const page = (load: () => Promise<PageModule>) => () =>
  load().then((module) => ({ Component: module.default }))

/** What belongs to a person (plan, deadlines, notices, settings, the CV editor): without a profile, to the landing page. */
const personalPage = (load: () => Promise<PageModule>) => () =>
  load().then(({ default: Screen }) => ({
    Component: () => (
      <RequireProfile>
        <Screen />
      </RequireProfile>
    ),
  }))

export const router = createBrowserRouter([
  {
    path: 'entrar',
    HydrateFallback: AppLoading,
    lazy: publicPage(() => import('../features/onboarding/OnboardingPage')),
  },
  {
    // Public, outside the app's layout: what someone sees after scanning a card (docs/decisoes/0014).
    path: 'c/:slug',
    HydrateFallback: AppLoading,
    lazy: publicPage(() => import('../features/cv/PublicCardPage')),
  },
  {
    // Public: what the family sees; the data travels in the link's fragment (docs/decisoes/0018).
    path: 'familia',
    HydrateFallback: AppLoading,
    lazy: publicPage(() => import('../features/family/FamilyPage')),
  },
  {
    Component: Layout,
    // Shown while a screen's code downloads on the first visit (deep links, slow networks).
    HydrateFallback: AppLoading,
    children: [
      // Outside: the landing page brings its own margins (bare); signed in, the bento uses the whole width.
      { index: true, Component: IndexPage, handle: { bare: true, wide: true } satisfies RouteHandle },
      { path: 'teste', lazy: page(() => import('../features/assessment/AssessmentPage')) },
      { path: 'teste/resultado', lazy: page(() => import('../features/assessment/ResultPage')) },
      { path: 'teste/valencias', lazy: page(() => import('../features/assessment/StrengthsPage')) },
      { path: 'testes', lazy: page(() => import('../features/tests/TestsPage')) },
      { path: 'treino', lazy: page(() => import('../features/psychotech/PsychotechPage')) },
      { path: 'exames-de-acesso', lazy: page(() => import('../features/accessExams/AccessExamsPage')) },
      { path: 'entrevistas', lazy: page(() => import('../features/interviews/InterviewsPage')) },
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
        path: 'cursos/curso/:id',
        handle: { wide: true } satisfies RouteHandle,
        lazy: page(() => import('../features/training/CatalogCoursePage')),
      },
      {
        path: 'cursos/:id',
        handle: { wide: true } satisfies RouteHandle,
        lazy: page(() => import('../features/training/CoursePage')),
      },
      { path: 'kursos', lazy: page(() => import('../features/kursos/KursosPage')) },
      { path: 'kursos/:curso', lazy: page(() => import('../features/kursos/CourseOverviewPage')) },
      {
        path: 'kursos/:curso/exame',
        handle: { reader: true } satisfies RouteHandle,
        lazy: page(() => import('../features/kursos/ExamPage')),
      },
      { path: 'kursos/:curso/concluido', lazy: page(() => import('../features/kursos/CompletedPage')) },
      {
        path: 'kursos/:curso/:unidade/:licao',
        handle: { reader: true } satisfies RouteHandle,
        lazy: page(() => import('../features/kursos/LessonPage')),
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
      { path: 'novidades/:id', lazy: page(() => import('../features/news/NewsDetailPage')) },
      { path: 'oportunidades', lazy: page(() => import('../features/opportunities/OpportunitiesPage')) },
      // Old addresses (shared links, bookmarks): the same list, now a tab of Oportunidades.
      { path: 'bolsas', Component: () => <KeepQuery to="bolsas" /> },
      { path: 'sem-universidade', lazy: page(() => import('../features/noDegree/NoDegreePage')) },
      { path: 'mentores', lazy: page(() => import('../features/mentors/MentorsPage')) },
      { path: 'plano', lazy: personalPage(() => import('../features/plan/PlanPage')) },
      { path: 'prazos', lazy: personalPage(() => import('../features/deadlines/DeadlinesPage')) },
      { path: 'estagios', Component: () => <KeepQuery to="estagios" /> },
      {
        path: 'notificacoes',
        lazy: personalPage(() => import('../features/notifications/NotificationsPage')),
      },
      { path: 'suporte', lazy: page(() => import('../features/support/SupportPage')) },
      { path: 'configuracoes', lazy: personalPage(() => import('../features/settings/SettingsPage')) },
      { path: 'termos', lazy: publicPage(() => import('../features/legal/TermsPage')) },
      { path: 'privacidade', lazy: publicPage(() => import('../features/legal/PrivacyPage')) },
      { path: 'cv', lazy: page(() => import('../features/cv/CvPage')) },
      { path: 'cv/modelos/:id', lazy: page(() => import('../features/cv/CvExamplePage')) },
      { path: 'cv/passo-a-passo', lazy: personalPage(() => import('../features/cv/CvWizardPage')) },
      { path: 'cv/editar', lazy: personalPage(() => import('../features/cv/CvEditorPage')) },
      { path: 'cv/cartao', lazy: personalPage(() => import('../features/cv/CvCardPage')) },
      {
        path: 'perfil',
        handle: { wide: true } satisfies RouteHandle,
        lazy: personalPage(() => import('../features/profile/ProfilePage')),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
