import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../test/render'
import { AppLoading } from './AppLoading'

describe('AppLoading', () => {
  it('tells assistive technology that the page is loading', () => {
    renderWithApp(<AppLoading />)

    expect(screen.getByText('A carregar…').parentElement).toHaveAttribute('aria-busy', 'true')
  })
})
