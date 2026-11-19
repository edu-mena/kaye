import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CardRow, ROW_ITEM } from './CardRow'

describe('CardRow', () => {
  it('takes the keyboard focus even when its cards hold no link, so it can be slid (WCAG 2.1.1)', async () => {
    render(
      <CardRow label="Vê a app por dentro">
        <li className={ROW_ITEM}>
          <img alt="Teste vocacional" src="teste.webp" />
        </li>
      </CardRow>,
    )
    const row = screen.getByRole('list', { name: 'Vê a app por dentro' })
    await userEvent.tab()
    expect(row).toHaveFocus()
  })
})
