import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CARD_MODELS, type CardStyle } from '../../data/types'
import type { CardDetails } from '../../domain/cardStyle'
import { qrModules } from '../../lib/qr'
import { downloadCardPdf } from './cardExport'
import { CARD_HEIGHT, CARD_WIDTH, layoutCard } from './cardLayout'
import type { CvOp } from './cvLayout'

const saved = vi.hoisted(() => vi.fn<(blob: Blob, name: string) => void>())
vi.mock('../../lib/saveFile', () => ({ saveFile: saved }))

const STYLE: CardStyle = {
  font: 'inter',
  accent: '#021d6d',
  text: '#16171b',
  nameSize: 16,
  roleSize: 9,
  contactSize: 7,
  align: 'left',
  photo: true,
  qr: true,
}
const DETAILS: CardDetails = {
  name: 'Joana Manuel',
  headline: 'Analista de dados',
  contacts: ['joana@exemplo.ao', '+244 923 000 000', 'linkedin.com/in/joana'],
}
const PHOTO = 'data:image/jpeg;base64,AAAA'
const QR = qrModules('https://kaye.ao/p/joana')
/** Monospaced, as wide as the text: enough to see the lines shrink and cut. */
const measure = (text: string, size: number) => text.length * size * 0.18

const texts = (ops: CvOp[]) => ops.flatMap((op) => (op.kind === 'text' ? [op.text] : []))
const inside = (op: CvOp) =>
  op.kind !== 'text' || (op.x >= -0.01 && op.x <= CARD_WIDTH && op.y >= 0 && op.y <= CARD_HEIGHT + 0.01)

beforeEach(() => {
  saved.mockClear()
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>(async () => new Response(null, { status: 404 })),
  )
})

describe('layoutCard', () => {
  it.each(CARD_MODELS)('the %s card shows the name, the role and the contacts inside the card', (model) => {
    const { front, back } = layoutCard({
      details: DETAILS,
      style: STYLE,
      model,
      measure,
      photo: PHOTO,
      qr: QR,
    })
    const all = [...texts(front), ...texts(back)]
    expect(all).toContain('Joana Manuel')
    expect(all.some((text) => text.startsWith('Analista'))).toBe(true)
    expect(all.join(' ')).toContain('joana@exemplo.ao')
    expect([...front, ...back].every(inside)).toBe(true)
  })

  it.each(CARD_MODELS)(
    'the %s card works centred, without photo or QR, and empty with a placeholder',
    (model) => {
      const centred = layoutCard({
        details: DETAILS,
        style: { ...STYLE, align: 'center', photo: false, qr: false },
        model,
        measure,
        photo: null,
        qr: null,
      })
      expect(texts(centred.front)).toContain('Joana Manuel')
      expect([...centred.front, ...centred.back].some((op) => op.kind === 'image')).toBe(false)

      const empty = layoutCard({
        details: { name: '', headline: '', contacts: [] },
        style: STYLE,
        model,
        measure,
        placeholder: 'O teu nome',
      })
      expect(texts(empty.front).join(' ')).toContain('O teu nome')
    },
  )

  it('puts a long name on two smaller lines and cuts it only as a last resort', () => {
    // Too long for two lines even at the smallest size.
    const name = 'Joana Manuel da Silva Fernandes de Almeida Cardoso Neto Baptista Domingos Kiala '.repeat(2)
    const { front } = layoutCard({ details: { ...DETAILS, name }, style: STYLE, model: 'claro', measure })
    const lines = front.flatMap((op) => (op.kind === 'text' && op.bold ? [op] : []))
    expect(lines).toHaveLength(2)
    expect(lines.every((op) => op.size < STYLE.nameSize)).toBe(true)
    expect(lines[1]?.text.endsWith('…')).toBe(true)
  })
})

describe('downloadCardPdf', () => {
  it('saves a two-page PDF named after the person', async () => {
    await downloadCardPdf({ details: DETAILS, style: STYLE, model: 'faixa', photo: null, qr: QR })
    await waitFor(() => expect(saved).toHaveBeenCalledOnce())
    const [blob, name] = saved.mock.calls[0] ?? []
    expect(blob?.type).toBe('application/pdf')
    expect(name).toBe('cartao-joana-manuel.pdf')
  })
})
