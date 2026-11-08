declare global {
  interface Window {
    __APP_CONFIG__?: { API_URL?: string }
  }
}

const raw = window.__APP_CONFIG__?.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3333'

export const API_URL = String(raw).replace(/\/+$/, '')
