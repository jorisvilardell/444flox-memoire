import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import env from '#start/env'
import User from '#models/user'
import { InvalidCredentialsError } from '#exceptions/domain_error'

const ADMIN_EMAIL = 'admin@carnet.local'
const TOKEN_TTL = '30 days'

const sha256 = (value: string) => createHash('sha256').update(value).digest()

export default class AuthService {
  async login(password: string) {
    // Hashing first gives equal-length buffers, which timingSafeEqual requires.
    const expected = sha256(env.get('ADMIN_PASSWORD').release())
    if (!timingSafeEqual(sha256(password), expected)) throw new InvalidCredentialsError()

    const admin = await this.ensureAdmin()
    const token = await User.accessTokens.create(admin, ['*'], { expiresIn: TOKEN_TTL })

    return {
      token: token.value!.release(),
      expiresAt: token.expiresAt!.toISOString(),
    }
  }

  async logout(user: User) {
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }
  }

  // The password column is unused (login goes through ADMIN_PASSWORD) but must hold a hash.
  private ensureAdmin() {
    return User.firstOrCreate(
      { email: ADMIN_EMAIL },
      { fullName: 'Admin', password: randomBytes(32).toString('hex') }
    )
  }
}
