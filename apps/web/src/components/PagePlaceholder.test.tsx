import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CvPage from '../features/cv/CvPage'
import ExplorePage from '../features/explore/ExplorePage'
import JobsPage from '../features/jobs/JobsPage'
import { renderWithApp } from '../test/render'

describe('tabs that are not built yet', () => {
  it.each([
    [ExplorePage, 'Explorar'],
    [JobsPage, 'Vagas'],
    [CvPage, 'CV'],
  ])('show their title and a "coming soon" badge', (Page, title) => {
    renderWithApp(<Page />)

    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(screen.getByText('Em breve')).toBeInTheDocument()
  })
})
