// Web Push in the service worker: vite.config.ts adds this file to the generated sw.js (workbox importScripts).
// The server sends {title, body, icon, badge, data: {url}} (apps/api/app/Notifications/PushNotice.php). Tapping
// the notification opens that page of the app, in a window already open when there is one. Only a path of
// this site is ever opened: anything else opens the home page.

/** A path of this site ("/prazos"), or "/" for anything else (another site, "//host", nothing). */
function kayePath(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

function readPush(event) {
  try {
    const data = event.data ? event.data.json() : {}
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

self.addEventListener('push', (event) => {
  const data = readPush(event)
  const title = typeof data.title === 'string' && data.title !== '' ? data.title : 'Kayé'
  event.waitUntil(
    self.registration.showNotification(title, {
      body: typeof data.body === 'string' ? data.body : '',
      icon: typeof data.icon === 'string' ? data.icon : undefined,
      badge: typeof data.badge === 'string' ? data.badge : undefined,
      data: { url: kayePath(data.data && data.data.url) },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = kayePath(event.notification.data && event.notification.data.url)
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => 'focus' in client)
      if (open) return open.focus().then((client) => client.navigate(url))
      return self.clients.openWindow(url)
    }),
  )
})
