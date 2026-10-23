import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CareersPage from '../features/careers/CareersPage'
import CvPage from '../features/cv/CvPage'
import TrainingPage from '../features/training/TrainingPage'
import { renderWithApp } from '../test/render'

describe('tabs that are not built yet', () => {
  it.each([
    [CareersPage, 'Carreiras'],
    [TrainingPage, 'Formação'],
    [CvPage, 'CV'],
  ])('show their title and a "coming soon" badge', (Page, title) => {
    renderWithApp(<Page />)

    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(screen.getByText('Em breve')).toBeInTheDocument()
  })
})
