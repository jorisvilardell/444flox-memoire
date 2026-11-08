import { resolveImageUrl } from '../../shared/api-client'
import { useIsAdmin } from '../auth/auth.api'
import { EntryBody } from './EntryBody'
import type { Entry } from './types'
import { useEntryUi } from './entry-ui'

interface EntryDetailProps {
  entry: Entry
  /** Reading overlay variant: larger title, smaller image. */
  overlay?: boolean
}

export function EntryDetail({ entry, overlay = false }: EntryDetailProps) {
  const isAdmin = useIsAdmin()
  const { openActions } = useEntryUi()
  const image = resolveImageUrl(entry.image)

  return (
    <>
      <div className="preview-header-row">
        <span className="preview-tag">
          {entry.type} // {entry.date}
        </span>
        {isAdmin && (
          <button type="button" className="btn-options-dots" aria-label="Options" onClick={() => openActions(entry.id)}>
            ...
          </button>
        )}
      </div>
      <h2 className="preview-title" style={overlay ? { fontSize: '2.5rem', marginBottom: '1rem' } : undefined}>
        <span>{entry.title}</span>
      </h2>
      {entry.subtitle && <div className="preview-subtitle">{entry.subtitle}</div>}
      <EntryBody entry={entry} />
      {image && (
        <img
          src={image}
          className="preview-image"
          style={overlay ? { maxHeight: '40vh', marginTop: '1.5rem' } : undefined}
          alt="Visuel"
        />
      )}
    </>
  )
}
