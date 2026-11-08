import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { loginThrottle } from '#start/limiter'
import { controllers } from '#generated/controllers'

router.where('id', router.matchers.uuid())

router.get('/health', () => ({ status: 'ok' }))

router
  .group(() => {
    router.post('auth/login', [controllers.Auth, 'login']).use(loginThrottle)
    router.get('entries', [controllers.Entries, 'index'])
    router.get('entries/:id', [controllers.Entries, 'show'])
    router.get('images/:id', [controllers.Images, 'show'])

    router
      .group(() => {
        router.get('auth/me', [controllers.Auth, 'me'])
        router.post('auth/logout', [controllers.Auth, 'logout'])
        router.post('entries', [controllers.Entries, 'store'])
        router.put('entries/:id', [controllers.Entries, 'update'])
        router.delete('entries/:id', [controllers.Entries, 'destroy'])
        router.patch('entries/:id/move', [controllers.Entries, 'move'])
        router.post('images', [controllers.Images, 'store'])
      })
      .use(middleware.auth())
  })
  .prefix('/api')
