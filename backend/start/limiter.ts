import limiter from '@adonisjs/limiter/services/main'

// Brute-force guard on the only anonymous write endpoint.
export const loginThrottle = limiter.define('login', (ctx) => {
  return limiter.allowRequests(10).every('1 minute').usingKey(ctx.request.ip())
})
