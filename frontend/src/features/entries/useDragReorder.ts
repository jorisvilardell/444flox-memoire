import { useRef } from 'react'
import { useIsAdmin } from '../auth/auth.api'
import { notify } from '../../shared/toast'
import { useEntries, useReorderEntry } from './entries.api'

/** Drag-and-drop reordering props for a draggable row; inert when not logged in. */
export function useDragReorder() {
  const isAdmin = useIsAdmin()
  const { data: entries = [] } = useEntries()
  const reorder = useReorderEntry(entries)
  const dragged = useRef<string | null>(null)

  return {
    isAdmin,
    props: (id: string) => ({
      draggable: isAdmin,
      onDragStart: (e: React.DragEvent<HTMLElement>) => {
        dragged.current = id
        e.currentTarget.classList.add('dragging')
        e.dataTransfer.effectAllowed = 'move'
      },
      onDragEnd: (e: React.DragEvent<HTMLElement>) => e.currentTarget.classList.remove('dragging'),
      onDragOver: (e: React.DragEvent<HTMLElement>) => e.preventDefault(),
      onDrop: (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault()
        const from = dragged.current
        dragged.current = null
        if (from && from !== id) reorder.mutate({ id: from, targetId: id }, { onError: (err) => notify(err.message) })
      },
    }),
  }
}
