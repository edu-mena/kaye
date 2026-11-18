import { Capacitor } from '@capacitor/core'
import { deletePushSubscription, savePushSubscription } from '../data/account'

// Web Push (VAPID) in the browser and the installed PWA. The Android app is a WebView, where Web Push does not
// work, and iOS only has it inside the installed PWA: there the option is simply not offered (no error).

/** Whether this browser can receive Web Push notices. */
export function pushSupported(): boolean {
  return (
    !Capacitor.isNativePlatform() &&
    'serviceWorker' in navigator &&
    typeof window.PushManager === 'function' &&
    typeof window.Notification === 'function'
  )
}

/** The VAPID key as the bytes `pushManager.subscribe` wants (it comes base64url-encoded). */
export function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4))
    .replaceAll('-', '+')
    .replaceAll('_', '/')
  const raw = atob(base64)
  const bytes = new Uint8Array(new ArrayBuffer(raw.length))
  for (let index = 0; index < raw.length; index++) bytes[index] = raw.charCodeAt(index)
  return bytes
}

/** The service worker, or an error after a while: without one (a dev server) `ready` never settles. */
async function serviceWorker(): Promise<ServiceWorkerRegistration> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('No service worker')), 10_000)
  })
  try {
    return await Promise.race([navigator.serviceWorker.ready, timeout])
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Asks the browser's permission (call it only from a tap), subscribes and gives the subscription to the
 * server. 'denied' when the person, or the browser, said no.
 */
export async function subscribePush(key: string): Promise<'granted' | 'denied'> {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return 'denied'
  const registration = await serviceWorker()
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) }))
  const { endpoint, keys } = subscription.toJSON()
  if (!endpoint || !keys?.p256dh || !keys.auth) throw new Error('Incomplete push subscription')
  await savePushSubscription({
    endpoint,
    keys: { p256dh: keys.p256dh, auth: keys.auth },
    contentEncoding: 'aes128gcm',
  })
  return 'granted'
}

/** Ends this browser's subscription, here and on the server. */
export async function unsubscribePush(): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  if (!subscription) return
  await deletePushSubscription(subscription.endpoint)
  await subscription.unsubscribe()
}
