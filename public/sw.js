// Service Worker do Jogos de Hoje
// Responsável por notificações push em segundo plano (mesmo com o app fechado) e controle de PWA

const CACHE_NAME = 'jogosdehoje-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/logo.png',
  '/icon-192.png',
  '/apple-touch-icon.png',
  '/favicon-32.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Falha ao pré-carregar alguns assets:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      }),
      self.clients.claim()
    ])
  );
});

// Manipulação de Notificações Push (recebidas via servidor mesmo com o app/navegador fechado)
self.addEventListener('push', (event) => {
  let data = {
    title: 'Jogos de Hoje ⚽',
    body: 'Novo alerta de jogo para você!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/',
    tag: 'jogosdehoje-alert',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  const notificationOptions = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    image: data.image || undefined,
    tag: data.tag || 'jogosdehoje-match-alert',
    renotify: true,
    vibrate: [200, 100, 200, 100, 300],
    data: {
      url: data.url || '/',
      matchId: data.matchId,
      time: Date.now()
    },
    actions: [
      { action: 'open', title: '👀 Ver Jogo' },
      { action: 'dismiss', title: '✕ Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

// Clique na Notificação Push
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já houver uma aba aberta do site, foca nela e navega
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Se não houver janela aberta (app fechado), abre nova janela com a URL alvo
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
