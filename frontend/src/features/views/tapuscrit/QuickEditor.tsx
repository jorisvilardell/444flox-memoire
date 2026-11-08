import { useState } from 'react'
import { notify } from '../../../shared/toast'
import { todayFr } from '../../../shared/format'
import { useCreateEntry } from '../../entries/entries.api'
import { ENTRY_TYPES, type EntryInput, type EntryType } from '../../entries/types'

interface Draft {
  title: string
  content: string
  refUrl: string
  citeAuthor: string
  speaker1: string
  speaker2: string
  interviewBody: string
  resUrl: string
}

const EMPTY: Draft = {
  title: '',
  content: '',
  refUrl: '',
  citeAuthor: '',
  speaker1: '',
  speaker2: '',
  interviewBody: '',
  resUrl: '',
}

function buildInput(type: EntryType, d: Draft): EntryInput {
  const base: EntryInput = { title: d.title.trim(), type, image: null, tags: [type, 'NOTE'], content: d.content, meta: {} }
  switch (type) {
    case 'RÉFÉRENCES':
      return { ...base, image: d.refUrl.trim() || null }
    case 'CITATION':
      return { ...base, meta: { apaCiteAuthor: d.citeAuthor } }
    case 'INTERVIEW':
      return {
        ...base,
        content: '',
        meta: {
          speaker1: d.speaker1,
          speaker2: d.speaker2,
          dialogue: d.interviewBody
            .split('\n')
            .filter((l) => l.trim())
            .map((text, i) => ({ spk: i % 2 === 0 ? 'spk1' : 'spk2', text })),
        },
      }
    case 'RESSOURCE':
      return { ...base, meta: { apaResUrl: d.resUrl } }
    default:
      return base
  }
}

export function QuickEditor() {
  const [type, setType] = useState<EntryType>('TEXTE')
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const create = useCreateEntry()
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  const save = () => {
    if (!draft.title.trim()) return
    create.mutate(buildInput(type, draft), {
      onSuccess: () => setDraft(EMPTY),
      onError: (err) => notify(err.message),
    })
  }

  return (
    <div className="tapuscrit-editor-block">
      <div className="editor-header-line">
        <span className="live-date">{todayFr()}</span>
        <select
          className="quick-type-select"
          aria-label="Type d'entrée"
          value={type}
          onChange={(e) => setType(e.target.value as EntryType)}
        >
          {ENTRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <input
          type="text"
          aria-label="Titre"
          placeholder="Titre de la note..."
          autoComplete="off"
          value={draft.title}
          onChange={(e) => set({ title: e.target.value })}
        />
      </div>

      {type === 'TEXTE' && (
        <textarea
          aria-label="Contenu"
          placeholder="Contenu de la note..."
          value={draft.content}
          onChange={(e) => set({ content: e.target.value })}
        />
      )}
      {type === 'RÉFÉRENCES' && (
        <div>
          <input
            type="url"
            aria-label="URL de l'image"
            placeholder="URL de l'image (ex: https://...)"
            value={draft.refUrl}
            onChange={(e) => set({ refUrl: e.target.value })}
          />
          <textarea
            aria-label="Description"
            placeholder="Description de la référence..."
            value={draft.content}
            onChange={(e) => set({ content: e.target.value })}
          />
        </div>
      )}
      {type === 'CITATION' && (
        <div>
          <textarea
            aria-label="Citation"
            placeholder="« Citation exacte... »"
            value={draft.content}
            onChange={(e) => set({ content: e.target.value })}
          />
          <input
            type="text"
            aria-label="Auteur"
            placeholder="Auteur (ex: Klein, N.)"
            value={draft.citeAuthor}
            onChange={(e) => set({ citeAuthor: e.target.value })}
          />
        </div>
      )}
      {type === 'INTERVIEW' && (
        <div>
          <input
            type="text"
            aria-label="Interlocuteur 1"
            placeholder="Interlocuteur 1"
            value={draft.speaker1}
            onChange={(e) => set({ speaker1: e.target.value })}
          />
          <input
            type="text"
            aria-label="Interlocuteur 2"
            placeholder="Interlocuteur 2"
            value={draft.speaker2}
            onChange={(e) => set({ speaker2: e.target.value })}
          />
          <textarea
            aria-label="Échanges"
            placeholder="Échanges (une réplique par ligne, alternance 1/2)"
            value={draft.interviewBody}
            onChange={(e) => set({ interviewBody: e.target.value })}
          />
        </div>
      )}
      {type === 'RESSOURCE' && (
        <div>
          <textarea
            aria-label="Résumé"
            placeholder="Résumé de la ressource..."
            value={draft.content}
            onChange={(e) => set({ content: e.target.value })}
          />
          <input
            type="url"
            aria-label="URL"
            placeholder="URL du lien / article"
            value={draft.resUrl}
            onChange={(e) => set({ resUrl: e.target.value })}
          />
        </div>
      )}

      <div className="editor-actions">
        <button type="button" className="btn-submit" disabled={create.isPending} onClick={save}>
          + VALIDER ET AJOUTER
        </button>
      </div>
    </div>
  )
}
