import { useSyncExternalStore } from 'react'

let message: string | null = null
let timer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function notify(text: string) {
  message = text
  clearTimeout(timer)
  timer = setTimeout(() => {
    message = null
    emit()
  }, 5000)
  emit()
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useToast(): string | null {
  return useSyncExternalStore(subscribe, () => message)
}
