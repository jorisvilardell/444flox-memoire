import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors as authErrors } from '@adonisjs/auth'
import { errors as coreErrors } from '@adonisjs/core'
import { errors as vineErrors } from '@vinejs/vine'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { InvalidCredentialsError, InvalidInputError, NotFoundError } from '#exceptions/domain_error'

interface ErrorItem {
  message: string
  field?: string
}

/**
 * Translates domain and framework errors into the `{ errors: [...] }` contract.
 * Anything unrecognised becomes a generic 500 so no internals reach the client.
 */
export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = !app.inProduction

  async handle(error: unknown, ctx: HttpContext) {
    const mapped = this.toResponse(error)
    if (mapped) {
      return ctx.response.status(mapped.status).send({ errors: mapped.errors })
    }
    return super.handle(error, ctx)
  }

  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }

  private toResponse(error: unknown): { status: number; errors: ErrorItem[] } | null {
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return {
        status: 422,
        errors: error.messages.map((m: { message: string; field: string }) => ({
          message: m.message,
          field: m.field,
        })),
      }
    }
    if (error instanceof InvalidInputError) {
      return { status: 422, errors: [{ message: error.message, field: error.field }] }
    }
    if (error instanceof NotFoundError || error instanceof lucidErrors.E_ROW_NOT_FOUND) {
      return { status: 404, errors: [{ message: error.message }] }
    }
    if (
      error instanceof InvalidCredentialsError ||
      error instanceof authErrors.E_UNAUTHORIZED_ACCESS
    ) {
      return { status: 401, errors: [{ message: 'Unauthorized' }] }
    }
    if (error instanceof coreErrors.E_ROUTE_NOT_FOUND) {
      return { status: 404, errors: [{ message: 'Route not found' }] }
    }
    const status = (error as { status?: number }).status
    if (status === 413) {
      return { status: 413, errors: [{ message: 'Payload too large' }] }
    }
    if (status === 400) {
      return { status: 400, errors: [{ message: 'Bad request' }] }
    }
    return null
  }
}
