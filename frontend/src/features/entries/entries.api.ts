import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { request } from '../../shared/api-client'
import type { Entry, EntryInput } from './types'

export const entryKeys = {
  all: ['entries'] as const,
}

export function useEntries() {
  return useQuery({
    queryKey: entryKeys.all,
    queryFn: () => request<Entry[]>('/api/entries'),
  })
}

export function useCreateEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: EntryInput) => request<Entry>('/api/entries', { method: 'POST', json: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: entryKeys.all }),
  })
}

export function useUpdateEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EntryInput }) =>
      request<Entry>(`/api/entries/${id}`, { method: 'PUT', json: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: entryKeys.all }),
  })
}

export function useDeleteEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => request<void>(`/api/entries/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: entryKeys.all }),
  })
}

type Direction = 'up' | 'down'

async function moveOnce(id: string, direction: Direction): Promise<Entry[]> {
  return request<Entry[]>(`/api/entries/${id}/move`, { method: 'PATCH', json: { direction } })
}

export function useMoveEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: Direction }) => moveOnce(id, direction),
    onSuccess: (list) => qc.setQueryData(entryKeys.all, list),
    onError: () => qc.invalidateQueries({ queryKey: entryKeys.all }),
  })
}

/** Drag-and-drop reorder: the API only exposes one-step moves, so replay them sequentially. */
export function useReorderEntry(entries: Entry[]) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, targetId }: { id: string; targetId: string }) => {
      const from = entries.findIndex((e) => e.id === id)
      const to = entries.findIndex((e) => e.id === targetId)
      if (from < 0 || to < 0 || from === to) return null
      const direction: Direction = to < from ? 'up' : 'down'
      let list: Entry[] | null = null
      for (let i = 0; i < Math.abs(to - from); i++) list = await moveOnce(id, direction)
      return list
    },
    onSuccess: (list) => {
      if (list) qc.setQueryData(entryKeys.all, list)
    },
    onError: () => qc.invalidateQueries({ queryKey: entryKeys.all }),
  })
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return request<{ id: string; url: string }>('/api/images', { method: 'POST', form })
    },
  })
}
