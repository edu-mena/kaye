import { createBrowserRouter, Navigate } from 'react-router'
import HomePage from '../features/home/HomePage'
import { Layout } from './Layout'

// Home is in the first download; every other tab loads its code when opened.
export const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      {
        path: 'explorar',
        lazy: () => import('../features/explore/ExplorePage').then((m) => ({ Component: m.default })),
      },
      {
        path: 'vagas',
        lazy: () => import('../features/jobs/JobsPage').then((m) => ({ Component: m.default })),
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
