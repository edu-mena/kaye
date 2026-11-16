import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The sync with the account (VITE_DATA_SOURCE=api): offline first, merged at the first login, then each
// change goes up with its version; a 409 is merged, never overwritten. Each test loads fresh modules,
// so the store and the sync start as they do when the app opens.

type Modules = {
  sync: typeof import('./accountSync')
  store: typeof import('./userStore')
}

type Call = { method: string; path: string; body: unknown }
type Reply = { status?: number; body?: unknown } | 'offline'
type Routes = Record<string, Reply | Reply[]>

const ME = {
  id: 7,
  name: 'Joana',
  email: 'joana@example.com',
  avatarUrl: null,
  birthYear: 2008,
  minor: true,
  consents: [],
}
const PROFILE = {
  name: 'Joana',
  birthYear: 2008,
  province: 'Luanda',
  education: 'medio_tecnico',
  guardianInformed: true,
}

let calls: Call[] = []

/** Answers each "METHOD /path" with its reply; a list answers one call each, the last one repeats. */
function serve(routes: Routes) {
  calls = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const method = init.method ?? 'GET'
      const path = url.replace('/api/v1', '')
      calls.push({ method, path, body: init.body ? JSON.parse(init.body as string) : undefined })
      const route = routes[`${method} ${path}`]
      const reply = Array.isArray(route) ? (route.length > 1 ? route.shift() : route[0]) : route
      if (reply === 'offline') throw new TypeError('Failed to fetch')
      const status = reply?.status ?? (reply ? 200 : 404)
      return status === 204 ? new Response(null, { status }) : Response.json(reply?.body ?? {}, { status })
    }),
  )
}

const sent = (method: string, path: string) =>
  calls.filter((call) => call.method === method && call.path === path)

async function load(source = 'api'): Promise<Modules> {
  vi.stubEnv('VITE_DATA_SOURCE', source)
  vi.resetModules()
  return { sync: await import('./accountSync'), store: await import('./userStore') }
}

function seedDevice(data: Record<string, unknown>) {
  localStorage.setItem('kaye.user.v1', JSON.stringify({ version: 1, ...data }))
}

const record = () => JSON.parse(localStorage.getItem('kaye.sync.v1') ?? 'null') as unknown

describe('account sync', () => {
  // Each test's fresh module listens for "online" on the same window: removed after each test.
  let onlineListeners: EventListenerOrEventListenerObject[] = []

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const add = window.addEventListener.bind(window)
    vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
      if (type === 'online' && listener) onlineListeners.push(listener)
      add(type, listener, options)
    })
  })

  afterEach(() => {
    onlineListeners.forEach((listener) => window.removeEventListener('online', listener))
    onlineListeners = []
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('does nothing on the demo site, which has no accounts', async () => {
    serve({})
    const { sync } = await load('demo')

    await sync.startAccountSync()

    expect(calls).toEqual([])
    expect(sync.getAccount().status).toBe('off')
  })

  it('a visitor who never signed in is not asked who they are (no 401 in the console)', async () => {
    serve({ 'GET /me': { status: 401 } })
    const { sync } = await load()

    await sync.startAccountSync()

    expect(sync.getAccount().status).toBe('signedOut')
    expect(calls).toEqual([])
  })

  it('coming back from Google without a session stays signed out and sends nothing', async () => {
    serve({ 'GET /me': { status: 401 } })
    const { sync } = await load()
    const assign = vi.fn<(url: string) => void>()
    vi.stubGlobal('location', { ...window.location, assign })
    sync.beginSignIn('/plano')
    expect(assign).toHaveBeenCalledWith('/auth/google/redirect?next=%2Fplano')

    await sync.startAccountSync()

    expect(sync.getAccount().status).toBe('signedOut')
    expect(calls.map((call) => call.path)).toEqual(['/me'])
    expect(localStorage.getItem('kaye.signingIn')).toBeNull()
  })

  it('at the first login merges this device into the account and records the accepted texts', async () => {
    localStorage.setItem('kaye.signingIn', '1')
    seedDevice({ profile: PROFILE, savedCareers: ['enfermeiro'], photo: 'data:image/jpeg;base64,AAAA' })
    serve({
      'GET /me': { body: ME },
      'POST /me/data/merge': {
        body: { version: 3, data: { version: 1, profile: PROFILE, savedCareers: ['medico', 'enfermeiro'] } },
      },
      'POST /me/consents': { status: 201 },
    })
    const { sync, store } = await load()

    await sync.startAccountSync()

    const merge = sent('POST', '/me/data/merge')[0]?.body as { data: Record<string, unknown> }
    expect(merge.data.savedCareers).toEqual(['enfermeiro'])
    expect(merge.data).not.toHaveProperty('photo')
    expect(store.getUser().savedCareers).toEqual(['medico', 'enfermeiro'])
    // The photo never left, and the account's copy did not take it away.
    expect(store.getUser().photo).toBe('data:image/jpeg;base64,AAAA')
    expect(sent('POST', '/me/consents').map((call) => (call.body as { kind: string }).kind)).toEqual([
      'terms',
      'privacy',
      'guardian_informed',
    ])
    expect(record()).toEqual({ user: 7, version: 3, dirty: false })
    expect(sync.getAccount()).toMatchObject({ status: 'signedIn', me: { email: 'joana@example.com' } })
  })

  it('sends each change a moment later with the version it was based on', async () => {
    localStorage.setItem('kaye.sync.v1', JSON.stringify({ user: 7, version: 3, dirty: false }))
    serve({
      'GET /me': { body: { ...ME, consents: ['terms'] } },
      'GET /me/data': { body: { version: 3, data: null } },
      'PUT /me/data': { body: { version: 4, data: null } },
    })
    const { sync, store } = await load()
    await sync.startAccountSync()

    store.userActions.toggleSaved('medico')
    store.userActions.toggleSaved('advogado')
    expect(record()).toMatchObject({ dirty: true })
    await vi.runAllTimersAsync()

    const puts = sent('PUT', '/me/data')
    expect(puts).toHaveLength(1)
    expect(puts[0]?.body).toMatchObject({ version: 3, data: { savedCareers: ['medico', 'advogado'] } })
    expect(record()).toEqual({ user: 7, version: 4, dirty: false })
  })

  it('when another device wrote first, merges instead of overwriting', async () => {
    localStorage.setItem('kaye.sync.v1', JSON.stringify({ user: 7, version: 3, dirty: true }))
    seedDevice({ savedCareers: ['enfermeiro'] })
    serve({
      'GET /me': { body: ME },
      'PUT /me/data': { status: 409 },
      'POST /me/data/merge': {
        body: { version: 6, data: { version: 1, savedCareers: ['medico', 'enfermeiro'] } },
      },
    })
    const { sync, store } = await load()

    await sync.startAccountSync()

    expect(sent('POST', '/me/data/merge')).toHaveLength(1)
    expect(store.getUser().savedCareers).toEqual(['medico', 'enfermeiro'])
    expect(record()).toEqual({ user: 7, version: 6, dirty: false })
  })

  it('brings down what another device wrote while this one was closed', async () => {
    localStorage.setItem('kaye.sync.v1', JSON.stringify({ user: 7, version: 3, dirty: false }))
    serve({
      'GET /me': { body: ME },
      'GET /me/data': { body: { version: 5, data: { version: 1, savedCareers: ['medico'] } } },
    })
    const { sync, store } = await load()

    await sync.startAccountSync()

    expect(store.getUser().savedCareers).toEqual(['medico'])
    expect(record()).toEqual({ user: 7, version: 5, dirty: false })
    // Bringing it down is not a change to send back.
    await vi.runAllTimersAsync()
    expect(sent('PUT', '/me/data')).toEqual([])
  })

  it('offline keeps the change on the device and sends it when the network is back', async () => {
    localStorage.setItem('kaye.sync.v1', JSON.stringify({ user: 7, version: 3, dirty: false }))
    serve({
      'GET /me': { body: ME },
      'GET /me/data': { body: { version: 3, data: null } },
      'PUT /me/data': ['offline', { body: { version: 4, data: null } }],
    })
    const { sync, store } = await load()
    await sync.startAccountSync()

    store.userActions.toggleSaved('medico')
    await vi.runAllTimersAsync()
    expect(record()).toMatchObject({ version: 3, dirty: true })

    window.dispatchEvent(new Event('online'))
    await vi.runAllTimersAsync()

    expect(sent('PUT', '/me/data')).toHaveLength(2)
    expect(record()).toEqual({ user: 7, version: 4, dirty: false })
  })

  it('starting without network waits for it', async () => {
    localStorage.setItem('kaye.sync.v1', JSON.stringify({ user: 7, version: 3, dirty: false }))
    serve({ 'GET /me': ['offline', { status: 401 }] })
    const { sync } = await load()

    await sync.startAccountSync()
    expect(sync.getAccount().status).toBe('checking')

    window.dispatchEvent(new Event('online'))
    await vi.runAllTimersAsync()
    expect(sync.getAccount().status).toBe('signedOut')
  })

  it('a session that ended stops the sync', async () => {
    localStorage.setItem('kaye.sync.v1', JSON.stringify({ user: 7, version: 3, dirty: true }))
    serve({ 'GET /me': { body: ME }, 'PUT /me/data': { status: 401 } })
    const { sync } = await load()

    await sync.startAccountSync()

    expect(sync.getAccount().status).toBe('signedOut')
    expect(record()).toBeNull()
  })

  it('signing out ends the session and keeps the data on the device', async () => {
    seedDevice({ savedCareers: ['medico'] })
    localStorage.setItem('kaye.sync.v1', JSON.stringify({ user: 7, version: 3, dirty: false }))
    serve({
      'GET /me': { body: ME },
      'GET /me/data': { body: { version: 3, data: null } },
      'POST /auth/logout': { status: 204 },
    })
    const { sync, store } = await load()
    await sync.startAccountSync()

    await sync.signOut()

    expect(sent('POST', '/auth/logout')).toHaveLength(1)
    expect(sync.getAccount().status).toBe('signedOut')
    expect(store.getUser().savedCareers).toEqual(['medico'])
  })

  it('erasing deletes the account first, then this device', async () => {
    seedDevice({ profile: PROFILE })
    localStorage.setItem('kaye.sync.v1', JSON.stringify({ user: 7, version: 3, dirty: false }))
    serve({
      'GET /me': { body: ME },
      'GET /me/data': { body: { version: 3, data: null } },
      'DELETE /me': { status: 204 },
    })
    const { sync, store } = await load()
    await sync.startAccountSync()

    await sync.eraseEverything()

    expect(sent('DELETE', '/me')).toHaveLength(1)
    expect(store.getUser().profile).toBeNull()
    expect(record()).toBeNull()
  })

  it('when the account cannot be deleted, nothing is erased', async () => {
    seedDevice({ profile: PROFILE })
    localStorage.setItem('kaye.sync.v1', JSON.stringify({ user: 7, version: 3, dirty: false }))
    serve({
      'GET /me': { body: ME },
      'GET /me/data': { body: { version: 3, data: null } },
      'DELETE /me': 'offline',
    })
    const { sync, store } = await load()
    await sync.startAccountSync()

    await expect(sync.eraseEverything()).rejects.toThrow('Failed to fetch')

    expect(store.getUser().profile).not.toBeNull()
    expect(sync.getAccount().status).toBe('signedIn')
  })
})
