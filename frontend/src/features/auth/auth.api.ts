import { useSyncExternalStore } from 'react'
import { useMutation } from '@tanstack/react-query'
import { getToken, request, setToken, subscribeToken } from '../../shared/api-client'

interface LoginResponse {
  token: string
  expiresAt: string
}

export function useIsAdmin(): boolean {
  return useSyncExternalStore(subscribeToken, () => getToken() !== null)
}

export function useLogin() {
  return useMutation({
    mutationFn: (password: string) => request<LoginResponse>('/api/auth/login', { method: 'POST', json: { password } }),
    onSuccess: (data) => setToken(data.token),
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      try {
        await request<void>('/api/auth/logout', { method: 'POST' })
      } catch {
        // token may already be invalid server-side; local logout proceeds regardless
      }
    },
    onSettled: () => setToken(null),
  })
}
