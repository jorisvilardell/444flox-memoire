import { API_URL } from './config'
import { notify } from './toast'

const TOKEN_KEY = 'carnet_admin_token'

let token: string | null = readStoredToken()
const listeners = new Set<() => void>()

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getToken(): string | null {
  return token
}

export function setToken(next: string | null) {
  token = next
  try {
    if (next) localStorage.setItem(TOKEN_KEY, next)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage unavailable (private mode): token stays in memory for the session
  }
  listeners.forEach((l) => l())
}

export function subscribeToken(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  json?: unknown
  form?: FormData
}

export async function request<T>(path: string, { method = 'GET', json, form }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  let body: BodyInit | undefined
  if (form) {
    body = form
  } else if (json !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(json)
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body })
  } catch {
    throw new ApiError(0, 'Serveur injoignable')
  }

  if (!res.ok) {
    let message = `Erreur ${res.status}`
    try {
      const data = (await res.json()) as { errors?: { message?: string }[] }
      const first = data.errors?.[0]?.message
      if (first) message = first
    } catch {
      // non-JSON error body
    }
    // An invalid token on a protected route means the session is over; a failed login is a plain 401 too.
    if (res.status === 401 && token) {
      setToken(null)
      notify('Session expirée, reconnectez-vous')
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export function resolveImageUrl(image: string | null | undefined): string | null {
  if (!image) return null
  if (image.startsWith('/api/images/')) return `${API_URL}${image}`
  return /^https?:\/\//i.test(image) ? image : null
}
