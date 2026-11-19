import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { keyBytes, pushSupported, subscribePush, unsubscribePush } from './webPush'

// Web Push in the browser: when it is offered, the permission, the subscription sent to the server, and the
// way out. The API calls are checked on the wire (fetch).

const native = vi.hoisted(() => ({ value: false }))
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => native.value } }))

type FakeSubscription = {
  endpoint: string
  toJSON: () => PushSubscriptionJSON
  unsubscribe: () => Promise<boolean>
}

function fakeSubscription(endpoint = 'https://push.example.com/abc'): FakeSubscription {
  return {
    endpoint,
    toJSON: () => ({ endpoint, keys: { p256dh: 'p256', auth: 'secret' } }),
    unsubscribe: vi.fn<() => Promise<boolean>>().mockResolvedValue(true),
  }
}

function browser({ permission = 'granted', existing = null as FakeSubscription | null } = {}) {
  const subscribe = vi
    .fn<(options: PushSubscriptionOptionsInit) => Promise<FakeSubscription>>()
    .mockResolvedValue(fakeSubscription())
  const registration = {
    pushManager: {
      getSubscription: vi.fn<() => Promise<FakeSubscription | null>>().mockResolvedValue(existing),
      subscribe,
    },
  }
  vi.stubGlobal(
    'Notification',
    Object.assign(function Notification() {}, {
      requestPermission: vi.fn<() => Promise<string>>().mockResolvedValue(permission),
    }),
  )
  vi.stubGlobal('PushManager', function PushManager() {})
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: {
      ready: Promise.resolve(registration),
      getRegistration: vi.fn<() => Promise<typeof registration>>().mockResolvedValue(registration),
    },
  })
  const fetchMock = vi.fn<typeof fetch>(async () => Response.json({ ok: true }, { status: 201 }))
  vi.stubGlobal('fetch', fetchMock)
  return { subscribe, fetchMock }
}

describe('webPush', () => {
  beforeEach(() => {
    native.value = false
  })

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'serviceWorker')
  })

  it('is offered only in a browser with a service worker, PushManager and Notification', () => {
    expect(pushSupported()).toBe(false)

    browser()
    expect(pushSupported()).toBe(true)

    native.value = true
    expect(pushSupported()).toBe(false)
  })

  it('is not offered where PushManager is missing (iOS outside the installed app)', () => {
    browser()
    vi.stubGlobal('PushManager', undefined)

    expect(pushSupported()).toBe(false)
  })

  it('reads the base64url VAPID key as bytes', () => {
    expect([...keyBytes('AQID_-8')]).toEqual([1, 2, 3, 255, 239])
  })

  it('stops when the person does not allow it, and sends nothing', async () => {
    const { subscribe, fetchMock } = browser({ permission: 'denied' })

    await expect(subscribePush('AQID')).resolves.toBe('denied')
    expect(subscribe).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('subscribes with the key and gives the subscription to the server', async () => {
    const { subscribe, fetchMock } = browser()

    await expect(subscribePush('AQID')).resolves.toBe('granted')

    expect(subscribe).toHaveBeenCalledWith({
      userVisibleOnly: true,
      applicationServerKey: new Uint8Array([1, 2, 3]),
    })
    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe('/api/v1/me/push-subscriptions')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({
      endpoint: 'https://push.example.com/abc',
      keys: { p256dh: 'p256', auth: 'secret' },
      contentEncoding: 'aes128gcm',
    })
  })

  it('reuses the subscription the browser already has', async () => {
    const { subscribe } = browser({ existing: fakeSubscription('https://push.example.com/old') })

    await subscribePush('AQID')

    expect(subscribe).not.toHaveBeenCalled()
  })

  it('ends the subscription on the server and in the browser', async () => {
    const existing = fakeSubscription()
    const { fetchMock } = browser({ existing })

    await unsubscribePush()

    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe('/api/v1/me/push-subscriptions')
    expect(init?.method).toBe('DELETE')
    expect(existing.unsubscribe).toHaveBeenCalledOnce()
  })

  it('with no subscription there is nothing to end', async () => {
    const { fetchMock } = browser()

    await unsubscribePush()

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
