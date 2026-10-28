import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { encodeCrop } from '../lib/encodeImage'
import { renderWithApp } from '../test/render'
import { ImageCropper } from './ImageCropper'

vi.mock('../lib/encodeImage', () => ({
  encodeCrop: vi.fn<() => Promise<string>>(async () => 'data:image/webp;base64,AAA'),
}))

const picture = new File(['x'], 'eu.png', { type: 'image/png', lastModified: 1 })

/** jsdom has no layout: give the frame and the picture their sizes, then let the picture load. */
async function load(frame: { width: number; height: number }, image: { width: number; height: number }) {
  const button = screen.getByRole('button', { name: /Área de corte/ })
  Object.defineProperties(button, {
    clientWidth: { value: frame.width },
    clientHeight: { value: frame.height },
  })
  const img = await waitFor(() => {
    const found = button.querySelector('img')
    if (!found) throw new Error('the picture is still being read')
    return found
  })
  Object.defineProperties(img, {
    naturalWidth: { value: image.width },
    naturalHeight: { value: image.height },
  })
  fireEvent.load(img)
  return { button, img }
}

describe('ImageCropper', () => {
  it('starts centred and covering the frame, then moves and zooms', async () => {
    const onDone = vi.fn<(image: string) => void>()
    renderWithApp(
      <ImageCropper
        file={picture}
        title="Ajustar a foto"
        output={{ width: 320, height: 320 }}
        round
        onCancel={() => {}}
        onDone={onDone}
      />,
    )
    expect(screen.getByRole('button', { name: 'Aplicar' })).toBeDisabled()
    const { button, img } = await load({ width: 100, height: 100 }, { width: 400, height: 200 })
    expect(img).toHaveStyle({ width: '200px', height: '100px', transform: 'translate(-50px, 0px)' })

    fireEvent.keyDown(button, { key: 'ArrowRight' })
    expect(img).toHaveStyle({ transform: 'translate(-62px, 0px)' })
    // It never leaves an empty edge.
    for (let step = 0; step < 10; step += 1) fireEvent.keyDown(button, { key: 'ArrowLeft' })
    expect(img).toHaveStyle({ transform: 'translate(0px, 0px)' })

    fireEvent.change(screen.getByRole('slider', { name: 'Zoom' }), { target: { value: '2' } })
    expect(img).toHaveStyle({ width: '400px', height: '200px' })
    fireEvent.keyDown(button, { key: '-' })
    fireEvent.keyDown(button, { key: '+' })

    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    // At zoom 2 the picture is shown at its own size: the 100 px frame keeps 100 px of it.
    const [file, rect, output] = vi.mocked(encodeCrop).mock.calls[0] ?? []
    expect(file).toBe(picture)
    expect(rect?.width).toBeCloseTo(100)
    expect(output).toEqual({ width: 320, height: 320 })
    expect(onDone).toHaveBeenCalledWith('data:image/webp;base64,AAA')
  })

  it('drags the picture with the pointer', async () => {
    renderWithApp(
      <ImageCropper
        file={picture}
        title="Ajustar a capa"
        output={{ width: 300, height: 100 }}
        onCancel={() => {}}
        onDone={() => {}}
      />,
    )
    const { button, img } = await load({ width: 300, height: 100 }, { width: 300, height: 300 })
    expect(img).toHaveStyle({ transform: 'translate(0px, -100px)' })
    fireEvent.pointerDown(button, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(button, { clientX: 10, clientY: 40, pointerId: 1 })
    fireEvent.pointerUp(button, { pointerId: 1 })
    expect(img).toHaveStyle({ transform: 'translate(0px, -70px)' })
    fireEvent.pointerMove(button, { clientX: 10, clientY: 90, pointerId: 1 })
    expect(img).toHaveStyle({ transform: 'translate(0px, -70px)' })
  })

  it('says so when the picture cannot be prepared, and can be cancelled', async () => {
    vi.mocked(encodeCrop).mockRejectedValueOnce(new Error('no-canvas'))
    const onCancel = vi.fn<() => void>()
    renderWithApp(
      <ImageCropper
        file={picture}
        title="Ajustar"
        output={{ width: 10, height: 10 }}
        onCancel={onCancel}
        onDone={() => {}}
      />,
    )
    await load({ width: 100, height: 100 }, { width: 100, height: 100 })
    await userEvent.click(screen.getByRole('button', { name: 'Aplicar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível preparar esta imagem')
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('stays closed without a picture', () => {
    renderWithApp(
      <ImageCropper
        file={null}
        title="Ajustar"
        output={{ width: 10, height: 10 }}
        onCancel={() => {}}
        onDone={() => {}}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Aplicar' })).not.toBeInTheDocument()
  })
})
