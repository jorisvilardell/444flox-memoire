export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`)
  }
}

export class InvalidInputError extends Error {
  constructor(
    message: string,
    readonly field?: string
  ) {
    super(message)
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials')
  }
}
