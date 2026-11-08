import { useMemo, useState, type ReactNode } from 'react'
import { Modal } from '../../shared/Modal'
import { notify } from '../../shared/toast'
import { EntryDetail } from './EntryDetail'
import { EntryFormModal } from './EntryFormModal'
import { useDeleteEntry, useEntries, useMoveEntry } from './entries.api'
import { EntryUiContext, type EntryUi } from './entry-ui'

type FormTarget = { mode: 'create' } | { mode: 'edit'; id: string }

export function EntryUiProvider({ children }: { children: ReactNode }) {
  const { data: entries = [] } = useEntries()
  const [viewId, setViewId] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null)
  const move = useMoveEntry()
  const remove = useDeleteEntry()

  const ui = useMemo<EntryUi>(
    () => ({
      openView: (entry) => setViewId(entry.id),
      openActions: setActionId,
      openCreate: () => setFormTarget({ mode: 'create' }),
    }),
    [],
  )

  const viewed = entries.find((e) => e.id === viewId) ?? null
  const actionEntry = entries.find((e) => e.id === actionId) ?? null
  const editing = formTarget?.mode === 'edit' ? (entries.find((e) => e.id === formTarget.id) ?? null) : null
  const failure = (err: Error) => notify(err.message)

  const closeActions = () => setActionId(null)

  return (
    <EntryUiContext.Provider value={ui}>
      {children}

      {viewed && (
        <Modal title="LECTURE" zIndex={100} maxWidth={700} onClose={() => setViewId(null)}>
          <EntryDetail entry={viewed} overlay />
        </Modal>
      )}

      {actionEntry && (
        <Modal title="OPTIONS" zIndex={110} className="action-modal-content" onClose={closeActions}>
          <div className="action-buttons-list">
            <button
              type="button"
              className="btn-action-opt"
              onClick={() => {
                setFormTarget({ mode: 'edit', id: actionEntry.id })
                setViewId(null)
                closeActions()
              }}
            >
              [ ÉDITER / MODIFIER ]
            </button>
            <button
              type="button"
              className="btn-action-opt"
              onClick={() => {
                move.mutate({ id: actionEntry.id, direction: 'up' }, { onError: failure })
                closeActions()
              }}
            >
              [ MONTER ▲ ]
            </button>
            <button
              type="button"
              className="btn-action-opt"
              onClick={() => {
                move.mutate({ id: actionEntry.id, direction: 'down' }, { onError: failure })
                closeActions()
              }}
            >
              [ DESCENDRE ▼ ]
            </button>
            <button
              type="button"
              className="btn-action-opt danger"
              onClick={() => {
                if (confirm('Supprimer cette entrée ?')) {
                  remove.mutate(actionEntry.id, { onError: failure })
                  setViewId(null)
                }
                closeActions()
              }}
            >
              [ SUPPRIMER ]
            </button>
          </div>
        </Modal>
      )}

      {formTarget && (formTarget.mode === 'create' || editing) && (
        <EntryFormModal
          key={editing?.id ?? 'new'}
          entry={editing}
          onClose={() => setFormTarget(null)}
        />
      )}
    </EntryUiContext.Provider>
  )
}
