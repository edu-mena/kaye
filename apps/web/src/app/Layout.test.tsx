import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../test/render'
import { Layout } from './Layout'

describe('Layout', () => {
  it('shows the logo, the tagline and the tab bar', () => {
    renderWithApp(<Layout />)

    expect(screen.getByRole('img', { name: 'Kayé' })).toBeInTheDocument()
    expect(screen.getByText('Descobre o teu lugar na tecnologia')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
