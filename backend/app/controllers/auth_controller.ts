import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/auth_service'
import { loginValidator } from '#validators/auth'

@inject()
export default class AuthController {
  constructor(private authService: AuthService) {}

  async login({ request }: HttpContext) {
    const { password } = await request.validateUsing(loginValidator)
    return this.authService.login(password)
  }

  me() {
    return { admin: true }
  }

  async logout({ auth, response }: HttpContext) {
    await this.authService.logout(auth.getUserOrFail())
    return response.noContent()
  }
}
