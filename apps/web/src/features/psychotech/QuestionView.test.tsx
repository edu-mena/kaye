import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Diagram, Question } from '../../domain/psychotech'
import { renderWithApp } from '../../test/render'
import { QuestionView } from './QuestionView'

const math = (diagram: Diagram | undefined, topic: 'rectArea' | 'twoDraws'): Question => ({
  skill: 'quantitative',
  level: 'medium',
  kind: 'math',
  topic,
  params: { w: 6, h: 4, red: 3, blue: 2 },
  ...(diagram && { diagram }),
  options: ['24 cm²', '20 cm²', '10 cm²', '12 cm²'],
  answer: 0,
})

const DIAGRAMS: Diagram[] = [
  { kind: 'rect', w: 6, h: 4 },
  { kind: 'rightTriangle', a: 6, b: 8 },
  { kind: 'lShape', w: 10, h: 8, cw: 4, ch: 3 },
  { kind: 'trapezoid', top: 4, bottom: 8, height: 5 },
  { kind: 'cube', edge: 3 },
]

describe('QuestionView: quantitative', () => {
  it.each(DIAGRAMS)(
    'draws the $kind figure with the question and answers with the chosen option',
    async (diagram) => {
      const onAnswer = vi.fn<(index: number) => void>()
      renderWithApp(<QuestionView question={math(diagram, 'rectArea')} onAnswer={onAnswer} />)

      expect(screen.getByText('Um retângulo mede 6 cm por 4 cm. Qual é a área?')).toBeInTheDocument()
      expect(screen.getByRole('img', { name: 'Desenho da figura do problema' })).toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: '20 cm²' }))
      expect(onAnswer).toHaveBeenCalledWith(1)
    },
  )

  it('shows no drawing for a question without geometry', () => {
    renderWithApp(<QuestionView question={math(undefined, 'twoDraws')} onAnswer={() => undefined} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText(/Tiram-se duas/)).toBeInTheDocument()
  })
})
