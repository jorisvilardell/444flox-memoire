import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { JSONContent } from '@tiptap/react'
import { request } from '../../shared/api-client'

export interface Memoire {
  content: JSONContent | null
  updatedAt: string | null
}

const memoireKey = ['memoire'] as const

export function useMemoire() {
  return useQuery({
    queryKey: memoireKey,
    queryFn: () => request<Memoire>('/api/memoire'),
  })
}

export function useSaveMemoire() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: JSONContent) => request<Memoire>('/api/memoire', { method: 'PUT', json: { content } }),
    onSuccess: (saved) => qc.setQueryData(memoireKey, saved),
  })
}

export function useUploadMemoireImage() {
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return request<{ id: string; url: string }>('/api/images', { method: 'POST', form })
    },
  })
}
