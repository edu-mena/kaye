import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../../test/render'
import ProfilePage from './ProfilePage'

describe('ProfilePage', () => {
  it('switches the language and marks the chosen one', async () => {
    renderWithApp(<ProfilePage />)
    expect(screen.getByRole('button', { name: 'Português' })).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(screen.getByRole('button', { name: 'English' }))

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Português' })).toHaveAttribute('aria-pressed', 'false')
    expect(localStorage.getItem('kaye.locale')).toBe('en')
  })
})
