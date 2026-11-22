const routes = [
  { pattern: /^\/$/, name: 'home' },
  { pattern: /^\/catalog\/?$/, name: 'catalog' },
  { pattern: /^\/products\/(\d+)\/?$/, name: 'product', params: ['productId'] },
  { pattern: /^\/auth\/?$/, name: 'auth' },
  { pattern: /^\/cart\/?$/, name: 'cart', protected: true },
  { pattern: /^\/checkout\/?$/, name: 'checkout', protected: true },
  { pattern: /^\/payment\/(\d+)\/?$/, name: 'payment', params: ['orderId'], protected: true },
  { pattern: /^\/orders\/?$/, name: 'orders', protected: true },
  { pattern: /^\/orders\/(\d+)\/?$/, name: 'order', params: ['orderId'], protected: true },
  { pattern: /^\/account\/?$/, name: 'account', protected: true },
]

export function matchRoute(pathname = window.location.pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  for (const route of routes) {
    const match = route.pattern.exec(path)
    if (match) {
      return {
        name: route.name,
        protected: Boolean(route.protected),
        params: Object.fromEntries(
          (route.params ?? []).map((key, index) => [key, match[index + 1]]),
        ),
      }
    }
  }
  return { name: 'not-found', protected: false, params: {} }
}

export function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
