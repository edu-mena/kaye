import { afterEach, describe, expect, it, vi } from 'vitest'

// public/push-sw.js runs inside the service worker. Here it runs as a script on the test page, with a fake
// `registration` and `clients` on `self`, and its listeners caught as it adds them.

type Listener = (event: Record<string, unknown>) => void
type Window = { focus: () => Promise<unknown>; navigate: (url: string) => void }

// A path held in a variable: the app has no types for the plain script, and Vite loads it all the same.
const WORKER = '../../public/push-sw.js'

async function worker(windows: Window[] = []) {
  const listeners = new Map<string, Listener>()
  const showNotification = vi
    .fn<(title: string, options: NotificationOptions) => Promise<void>>()
    .mockResolvedValue()
  const openWindow = vi.fn<(url: string) => Promise<null>>().mockResolvedValue(null)
  const matchAll = vi.fn<() => Promise<Window[]>>().mockResolvedValue(windows)
  vi.spyOn(self, 'addEventListener').mockImplementation((type: string, listener: unknown) => {
    listeners.set(type, listener as Listener)
  })
  Object.assign(self, { registration: { showNotification }, clients: { matchAll, openWindow } })
  vi.resetModules()
  await import(/* @vite-ignore */ WORKER)

  const fire = async (type: string, event: Record<string, unknown>) => {
    let done: Promise<unknown> = Promise.resolve()
    listeners.get(type)?.({ ...event, waitUntil: (promise: Promise<unknown>) => (done = promise) })
    await done
  }
  return { fire, showNotification, openWindow }
}

const push = (payload: unknown) => ({ data: { json: () => payload } })

describe('push-sw.js', () => {
  afterEach(() => {
    Reflect.deleteProperty(self, 'registration')
    Reflect.deleteProperty(self, 'clients')
  })

  it('shows the notice the server sent', async () => {
    const { fire, showNotification } = await worker()

    await fire(
      'push',
      push({ title: 'Faltam 3 dias', body: 'A bolsa fecha', icon: '/i.png', data: { url: '/prazos' } }),
    )

    expect(showNotification).toHaveBeenCalledWith('Faltam 3 dias', {
      body: 'A bolsa fecha',
      icon: '/i.png',
      badge: undefined,
      data: { url: '/prazos' },
    })
  })

  it('a broken or foreign payload still shows Kayé and opens the home page', async () => {
    const { fire, showNotification } = await worker()

    await fire('push', { data: { json: () => JSON.parse('{') } })
    await fire('push', push({ title: 'x', data: { url: 'https://evil.example' } }))
    await fire('push', push({ title: 'y', data: { url: '//evil.example' } }))

    expect(showNotification.mock.calls.map(([title, options]) => [title, options.data])).toEqual([
      ['Kayé', { url: '/' }],
      ['x', { url: '/' }],
      ['y', { url: '/' }],
    ])
  })

  it('a tap opens the page in a new window when none is open', async () => {
    const { fire, openWindow } = await worker()
    const close = vi.fn<() => void>()

    await fire('notificationclick', { notification: { close, data: { url: '/prazos' } } })

    expect(close).toHaveBeenCalledOnce()
    expect(openWindow).toHaveBeenCalledWith('/prazos')
  })

  it('a tap uses the window already open', async () => {
    const navigate = vi.fn<(url: string) => void>()
    const open: Window = { focus: async () => open, navigate }
    const { fire, openWindow } = await worker([open])

    await fire('notificationclick', {
      notification: { close: vi.fn<() => void>(), data: { url: '/novidades' } },
    })

    expect(navigate).toHaveBeenCalledWith('/novidades')
    expect(openWindow).not.toHaveBeenCalled()
  })
})
