import { createContext, useContext } from 'react'
import type { Entry } from './types'

export interface EntryUi {
  openView: (entry: Entry) => void
  openActions: (id: string) => void
  openCreate: () => void
}

export const EntryUiContext = createContext<EntryUi | null>(null)

export function useEntryUi(): EntryUi {
  const ctx = useContext(EntryUiContext)
  if (!ctx) throw new Error('useEntryUi must be used inside EntryUiProvider')
  return ctx
}
