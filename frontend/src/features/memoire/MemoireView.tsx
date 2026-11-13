import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { EditorContent, useEditor, type JSONContent } from '@tiptap/react'
import { notify } from '../../shared/toast'
import { useIsAdmin } from '../auth/auth.api'
import { memoireExtensions } from './extensions'
import { useMemoire, useSaveMemoire, type Memoire } from './memoire.api'
import { MemoireBubbleMenu, MemoireToolbar } from './MemoireToolbar'

// Survives switching to another view and back, so unsaved edits are not lost with the unmounted editor.
let unsavedDraft: JSONContent | null = null

function formatUpdatedAt(iso: string) {
  const date = new Date(iso)
  return `${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
}

function isEmptyDoc(doc: JSONContent | null) {
  if (!doc?.content?.length) return true
  return doc.content.every((node) => node.type === 'paragraph' && !node.content?.length)
}

function MemoireDocument({ memoire }: { memoire: Memoire }) {
  const isAdmin = useIsAdmin()
  const save = useSaveMemoire()
  const [restored] = useState(() => (isAdmin ? unsavedDraft : null))
  const [editing, setEditing] = useState(restored !== null)
  const [dirty, setDirty] = useState(restored !== null)
  const dirtyRef = useRef(dirty)

  const editor = useEditor({
    extensions: memoireExtensions,
    content: restored ?? memoire.content ?? '',
    editable: false,
    immediatelyRender: true,
    editorProps: { attributes: { class: 'memoire-prose', lang: 'fr' } },
    onUpdate: () => setDirty(true),
  })

  const canEdit = editing && isAdmin

  useEffect(() => {
    editor.setEditable(canEdit, false)
  }, [editor, canEdit])

  useEffect(() => {
    if (restored) notify('Brouillon non enregistré restauré')
    unsavedDraft = null
  }, [restored])

  useEffect(
    () => () => {
      if (dirtyRef.current && !editor.isDestroyed) unsavedDraft = editor.getJSON()
    },
    [editor]
  )

  useEffect(() => {
    dirtyRef.current = dirty
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const saveNow = () => {
    if (save.isPending) return
    save.mutate(editor.getJSON(), {
      onSuccess: () => {
        setDirty(false)
        notify('Mémoire enregistré')
      },
      onError: (err) => notify(`Enregistrement impossible : ${err.message}`),
    })
  }

  const cancel = () => {
    if (dirty && !window.confirm('Abandonner les modifications non enregistrées ?')) return
    editor.commands.setContent(memoire.content ?? '', { emitUpdate: false })
    setDirty(false)
    setEditing(false)
  }

  const onSaveShortcut = useEffectEvent(saveNow)
  useEffect(() => {
    if (!canEdit) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        onSaveShortcut()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canEdit])

  const empty = isEmptyDoc(memoire.content) && !canEdit

  return (
    <div className={`memoire-page${canEdit ? ' is-editing' : ''}`}>
      <header className="memoire-header">
        <div>
          <h1 className="memoire-title">MÉMOIRE</h1>
          <span className="memoire-updated">
            {dirty
              ? 'MODIFICATIONS NON ENREGISTRÉES'
              : memoire.updatedAt
                ? `MIS À JOUR LE ${formatUpdatedAt(memoire.updatedAt)}`
                : 'BROUILLON'}
          </span>
        </div>
        {isAdmin && (
          <div className="memoire-actions">
            {canEdit ? (
              <>
                <button type="button" className="btn-secondary" onClick={cancel}>
                  {dirty ? 'ANNULER' : 'TERMINER'}
                </button>
                <button type="button" className="btn-primary" onClick={saveNow} disabled={!dirty || save.isPending}>
                  {save.isPending ? 'ENREGISTREMENT…' : 'ENREGISTRER'}
                </button>
              </>
            ) : (
              <button type="button" className="btn-primary" onClick={() => setEditing(true)}>
                MODIFIER
              </button>
            )}
          </div>
        )}
      </header>

      {canEdit && <MemoireToolbar editor={editor} />}
      {canEdit && <MemoireBubbleMenu editor={editor} />}

      {empty ? (
        <div className="photo-placeholder memoire-empty">[ LE MÉMOIRE N'A PAS ENCORE ÉTÉ RÉDIGÉ ]</div>
      ) : (
        <EditorContent editor={editor} className="memoire-sheet" />
      )}
    </div>
  )
}

export function MemoireView() {
  const { data, isPending, isError, error, refetch } = useMemoire()

  let content
  if (isPending) {
    content = <div className="status-screen">CHARGEMENT...</div>
  } else if (isError) {
    content = (
      <div className="status-screen" role="alert">
        <span>IMPOSSIBLE DE CHARGER LE MÉMOIRE ({error.message})</span>
        <button type="button" className="btn-secondary" onClick={() => refetch()}>
          RÉESSAYER
        </button>
      </div>
    )
  } else {
    content = <MemoireDocument memoire={data} />
  }

  return (
    <main id="memoireView" className="memoire-layout">
      {content}
    </main>
  )
}
