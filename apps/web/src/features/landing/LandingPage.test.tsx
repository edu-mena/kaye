import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import { LandingPage } from './LandingPage'

describe('LandingPage', () => {
  it("links Kayé's official profiles in the footer, the same the server lists in the structured data", async () => {
    renderWithApp(<LandingPage />)
    const follow = await screen.findByRole('navigation', { name: 'Segue o Kayé' })

    expect(within(follow).getByRole('link', { name: 'YouTube' })).toHaveAttribute(
      'href',
      'https://www.youtube.com/@KayeAngola',
    )
    expect(within(follow).getByRole('link', { name: 'TikTok' })).toHaveAttribute(
      'href',
      'https://www.tiktok.com/@kaye_angola',
    )
    expect(within(follow).getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'href',
      'https://www.facebook.com/profile.php?id=61596823982332',
    )
    // rel="me" tells search engines these profiles are the site's own.
    for (const link of within(follow).getAllByRole('link')) {
      expect(link).toHaveAttribute('rel', 'me noopener')
    }
  })
})
