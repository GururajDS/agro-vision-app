self.addEventListener("push", (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    data = { title: "Agro Vision", body: event.data ? event.data.text() : "" }
  }
  const title = data.title || "Agro Vision"
  const options = {
    body: data.body || "",
    icon: "/icon-light-32x32.png",
    badge: "/icon-light-32x32.png",
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow("/")
    }),
  )
})
