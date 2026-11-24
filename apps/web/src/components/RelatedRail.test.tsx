import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithApp } from '../test/render'
import { RelatedRail } from './RelatedRail'

const ITEMS = Array.from({ length: 10 }, (_, index) => ({
  id: `i${index}`,
  to: `/empresas/i${index}`,
  name: `Empresa ${index}`,
  meta: `${index + 1} carreiras`,
}))

describe('RelatedRail', () => {
  it('renders nothing without items', () => {
    const { container } = renderWithApp(<RelatedRail title="Quem contrata" icon="building" items={[]} />)
    expect(container.querySelector('section, article')).toBeNull()
  })

  it('names the list, links each item with why it is there, and the see-all link', () => {
    renderWithApp(
      <RelatedRail title="Quem contrata" icon="building" items={ITEMS.slice(0, 2)} seeAllTo="/empresas" />,
    )
    const rail = screen.getByRole('region', { name: 'Quem contrata' })
    expect(within(rail).getByRole('link', { name: 'Ver tudo' })).toHaveAttribute('href', '/empresas')
    const first = within(rail).getByRole('link', { name: /Empresa 0/ })
    expect(first).toHaveAttribute('href', '/empresas/i0')
    expect(first).toHaveTextContent('1 carreiras')
  })

  it('shows at most `max` items, and has no see-all link unless asked', () => {
    renderWithApp(
      <RelatedRail title="Onde estudar" icon="landmark" items={ITEMS} max={3} seeAllLabel="Ver institutos" />,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.queryByRole('link', { name: 'Ver institutos' })).not.toBeInTheDocument()
  })

  it('uses the label given for the see-all link', () => {
    renderWithApp(
      <RelatedRail
        title="Onde estudar"
        icon="landmark"
        items={ITEMS}
        seeAllTo="/academias"
        seeAllLabel="Ver institutos"
      />,
    )
    expect(screen.getByRole('link', { name: 'Ver institutos' })).toHaveAttribute('href', '/academias')
  })
})
