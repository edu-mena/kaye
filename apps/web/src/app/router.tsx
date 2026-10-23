import { createBrowserRouter, Navigate } from 'react-router'
import { AppLoading } from '../components/AppLoading'
import HomePage from '../features/home/HomePage'
import { Layout } from './Layout'

// Home is in the first download; every other tab loads its code when opened.
export const router = createBrowserRouter([
  {
    Component: Layout,
    // Shown while a tab's code downloads on the first visit (deep links, slow networks).
    HydrateFallback: AppLoading,
    children: [
      { index: true, Component: HomePage },
      {
        path: 'carreiras',
        lazy: () => import('../features/careers/CareersPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'formacao',
        lazy: () => import('../features/training/TrainingPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'cv',
        lazy: () => import('../features/cv/CvPage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'perfil',
        lazy: () => import('../features/profile/ProfilePage').then((m) => ({ Component: m.default })),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
