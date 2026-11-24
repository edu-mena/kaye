import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { steps } from '../../domain/exercises/build'
import { renderWithApp } from '../../test/render'
import { PracticeCard } from './ExerciseCard'

const make = () =>
  steps({
    id: 'steps-1',
    topic: 't',
    source: 'Kayé',
    prompt: 'Calcula a quota e o VLC.',
    data: ['Custo: 1.000 Kz.'],
    steps: [
      { label: 'Quota anual', answer: 250, unit: 'Kz' },
      { label: 'VLC', answer: 750, unit: 'Kz' },
    ],
    why: 'Quota = custo ÷ 4.',
  })

describe('PracticeCard: steps', () => {
  it('shows the data and one labelled box per cell, and says right or wrong in words', async () => {
    renderWithApp(<PracticeCard make={make} />)
    expect(screen.getByText('Custo: 1.000 Kz.')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText(/^Quota anual/), '250')
    await userEvent.type(screen.getByLabelText(/^VLC/), '700')
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }))
    expect(screen.getByText('Errado')).toBeInTheDocument()
    expect(screen.getByText(/Quota anual 250; VLC 750/)).toBeInTheDocument()

    // Changing a cell clears the verdict; fixing it makes it right.
    await userEvent.clear(screen.getByLabelText(/^VLC/))
    expect(screen.queryByText('Errado')).not.toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(/^VLC/), '750')
    await userEvent.click(screen.getByRole('button', { name: 'Verificar' }))
    expect(screen.getByText('Certo')).toBeInTheDocument()
  })
})
