import { useState, type FormEvent } from 'react'
import { Modal } from '../../shared/Modal'
import { notify } from '../../shared/toast'
import { useCreateEntry, useUpdateEntry, useUploadImage } from './entries.api'
import { emptyForm, formFromEntry, newDialogue, toInput, type FormState } from './form-state'
import { ENTRY_TYPES, type Entry, type EntryType } from './types'

interface EntryFormModalProps {
  entry: Entry | null
  onClose: () => void
}

const TYPE_LABEL: Record<EntryType, string> = {
  TEXTE: 'TEXTE',
  RÉFÉRENCES: 'RÉFÉRENCES',
  CITATION: 'CITATION',
  INTERVIEW: 'INTERVIEW',
  RESSOURCE: 'RESSOURCE / LIEN',
}

export function EntryFormModal({ entry, onClose }: EntryFormModalProps) {
  const [form, setForm] = useState<FormState>(() => (entry ? formFromEntry(entry) : emptyForm()))
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const create = useCreateEntry()
  const update = useUpdateEntry()
  const upload = useUploadImage()
  const busy = create.isPending || update.isPending || upload.isPending

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))
  const setMeta = (key: string, value: string) => setForm((f) => ({ ...f, meta: { ...f.meta, [key]: value } }))
  const m = (key: string) => form.meta[key] ?? ''

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      let image: string | null = entry?.image ?? null
      if (file) image = (await upload.mutateAsync(file)).url
      else if (form.imageUrl.trim()) image = form.imageUrl.trim()

      const input = toInput(form, image, entry)
      if (entry) await update.mutateAsync({ id: entry.id, input })
      else await create.mutateAsync(input)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      notify(message)
    }
  }

  const text = (id: string, label: string, placeholder: string, type: 'text' | 'url' = 'text') => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input id={id} type={type} placeholder={placeholder} value={m(id)} onChange={(e) => setMeta(id, e.target.value)} />
    </div>
  )

  return (
    <Modal title={entry ? "ÉDITION DE L'ENTRÉE" : 'INDEXATION'} zIndex={120} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label" htmlFor="entryTitle">
            TITRE PRINCIPAL
          </label>
          <input
            id="entryTitle"
            type="text"
            placeholder="Titre principal..."
            required
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="entryType">
            TYPE D'ENTRÉE
          </label>
          <select id="entryType" value={form.type} onChange={(e) => set('type', e.target.value as EntryType)}>
            {ENTRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>

        {form.type === 'TEXTE' && (
          <div className="dynamic-section">
            <div className="form-group">
              <label className="form-label" htmlFor="texteSubtitle">
                SOUS-TITRE
              </label>
              <input
                id="texteSubtitle"
                type="text"
                placeholder="Sous-titre optionnel..."
                value={form.subtitle}
                onChange={(e) => set('subtitle', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="texteFormat">
                FORMATAGE DU TEXTE
              </label>
              <select
                id="texteFormat"
                value={form.format}
                onChange={(e) => set('format', e.target.value as FormState['format'])}
              >
                <option value="paragraph">Paragraphe continu</option>
                <option value="bullet">Liste à puces (•)</option>
                <option value="numbered">Liste numérotée (1, 2, 3...)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="texteContent">
                CONTENU DU TEXTE
              </label>
              <textarea
                id="texteContent"
                placeholder="Rédigez votre note ou réflexion... (une ligne par puce pour les listes)"
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
              />
            </div>
          </div>
        )}

        {form.type === 'RÉFÉRENCES' && (
          <div className="dynamic-section">
            <div className="file-upload-zone">
              <div className="form-group">
                <label htmlFor="entryImageFile" className="form-label">
                  UPLOADER UNE IMAGE :
                </label>
                <input
                  type="file"
                  id="entryImageFile"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="entryImageUrl" className="upload-or">
                  OU URL EXTERNE :
                </label>
                <input
                  type="url"
                  id="entryImageUrl"
                  placeholder="https://domaine.com/image.jpg"
                  value={form.imageUrl}
                  onChange={(e) => set('imageUrl', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="refDescription">
                DESCRIPTION / LÉGENDE
              </label>
              <textarea
                id="refDescription"
                placeholder="Description de la référence visuelle..."
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
              />
            </div>
            <div className="apa-box">
              <span className="apa-tag">PROVENANCE APA7 (VISUEL)</span>
              {text('apaRefArtist', 'ARTISTE / CRÉATEUR', 'ex: Margiela, M.')}
              {text('apaRefYear', 'ANNÉE', 'ex: 1999')}
              {text('apaRefTitle', "TITRE DE L'ŒUVRE / COLLECTION", 'Titre...')}
              {text('apaRefSource', 'SOURCE / INSTITUTION', 'ex: Belle de Mai, Marseille')}
            </div>
          </div>
        )}

        {form.type === 'CITATION' && (
          <div className="dynamic-section">
            <div className="form-group">
              <label className="form-label" htmlFor="citationContent">
                CITATION / TEXTE EXACT
              </label>
              <textarea
                id="citationContent"
                placeholder="« Citation exacte... »"
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
              />
            </div>
            <div className="apa-box">
              <span className="apa-tag">PROVENANCE APA7 (CITATION)</span>
              {text('apaCiteAuthor', 'AUTEUR', 'ex: Klein, N.')}
              {text('apaCiteYear', 'ANNÉE DE PUBLICATION', 'ex: 2000')}
              {text('apaCiteBook', "TITRE DE L'OUVRAGE / ARTICLE", "Titre de l'ouvrage...")}
              {text('apaCitePublisher', 'ÉDITEUR / REVUE', 'ex: Knopf Canada')}
              {text('apaCitePage', 'PAGE(S)', 'ex: p. 45')}
            </div>
          </div>
        )}

        {form.type === 'INTERVIEW' && (
          <div className="dynamic-section">
            <div className="interview-speakers-setup">
              {text('speaker1', 'INTERLOCUTEUR 1', 'ex: Florent (Interviewer)')}
              {text('speaker2', 'INTERLOCUTEUR 2', 'ex: Designer (Invité)')}
            </div>
            <div className="form-group">
              <span className="form-label">ÉCHANGES DE L'INTERVIEW</span>
              <div className="dialogue-container">
                {form.dialogue.map((d) => (
                  <div key={d.key} className="dialogue-pair-item">
                    <select
                      aria-label="Interlocuteur"
                      value={d.spk}
                      onChange={(e) =>
                        set(
                          'dialogue',
                          form.dialogue.map((x) =>
                            x.key === d.key ? { ...x, spk: e.target.value === 'spk2' ? 'spk2' : 'spk1' } : x,
                          ),
                        )
                      }
                    >
                      <option value="spk1">Interlocuteur 1</option>
                      <option value="spk2">Interlocuteur 2</option>
                    </select>
                    <textarea
                      aria-label="Réplique"
                      placeholder="Réplique / Propos..."
                      value={d.text}
                      onChange={(e) =>
                        set(
                          'dialogue',
                          form.dialogue.map((x) => (x.key === d.key ? { ...x, text: e.target.value } : x)),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => set('dialogue', [...form.dialogue, newDialogue()])}
              >
                + AJOUTER UN ÉCHANGE
              </button>
            </div>
          </div>
        )}

        {form.type === 'RESSOURCE' && (
          <div className="dynamic-section">
            <div className="form-group">
              <label className="form-label" htmlFor="ressourceContent">
                NOTE DE SYNTHÈSE / RÉSUMÉ
              </label>
              <textarea
                id="ressourceContent"
                placeholder="Synthèse de l'article..."
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
              />
            </div>
            <div className="apa-box">
              <span className="apa-tag">PROVENANCE APA7 (ARTICLE / LIEN)</span>
              {text('apaResAuthor', 'AUTEUR(S)', 'Nom, P.')}
              {text('apaResDate', 'DATE / ANNÉE', 'ex: 1981')}
              {text('apaResTitle', "TITRE DE L'ARTICLE", 'Titre...')}
              {text('apaResJournal', 'NOM DE LA REVUE / SITE', 'Journal / Site Web')}
              {text('apaResUrl', 'URL DE LA RESSOURCE', 'https://...', 'url')}
            </div>
          </div>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn-submit" disabled={busy}>
          {busy ? 'ENVOI...' : entry ? 'ENREGISTRER' : 'POSTER'}
        </button>
      </form>
    </Modal>
  )
}
