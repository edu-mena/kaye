import { act, fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../test/render'
import { useUrlFilters, useUrlText } from './useUrlFilters'

/** A search field, and a button that changes the address from outside (like "Limpar filtros"). */
function Probe() {
  const [text, setText] = useUrlText('q')
  const [, setParam] = useUrlFilters()
  return (
    <>
      <input aria-label="q" value={text} onChange={(event) => setText(event.target.value, ['pagina'])} />
      <button type="button" onClick={() => setParam('q', 'redes')}>
        de fora
      </button>
      <button type="button" onClick={() => setParam('q', null)}>
        limpar
      </button>
    </>
  )
}

describe('useUrlText', () => {
  it('keeps every letter typed before the address catches up, and the address follows', () => {
    renderWithApp(<Probe />, { route: '/?pagina=3' })
    const field = screen.getByRole('textbox', { name: 'q' })

    act(() => {
      for (const value of ['d', 'da', 'dad', 'dado', 'dados']) fireEvent.change(field, { target: { value } })
    })
    expect(field).toHaveValue('dados')
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/\?q=dados$/)

    fireEvent.change(field, { target: { value: '   ' } })
    expect(field).toHaveValue('   ')
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })

  it('takes the address when it changes from outside', async () => {
    renderWithApp(<Probe />, { route: '/?q=dados' })
    const field = screen.getByRole('textbox', { name: 'q' })
    expect(field).toHaveValue('dados')

    await userEvent.click(screen.getByRole('button', { name: 'de fora' }))
    expect(field).toHaveValue('redes')

    await userEvent.type(field, ' e dados')
    await userEvent.click(screen.getByRole('button', { name: 'limpar' }))
    expect(field).toHaveValue('')
  })
})
