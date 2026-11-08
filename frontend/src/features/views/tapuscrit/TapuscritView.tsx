import { useState } from 'react'
import { resolveImageUrl } from '../../../shared/api-client'
import { useIsAdmin } from '../../auth/auth.api'
import { EntryBody } from '../../entries/EntryBody'
import { useEntryUi } from '../../entries/entry-ui'
import type { Entry } from '../../entries/types'
import { useDragReorder } from '../../entries/useDragReorder'
import { QuickEditor } from './QuickEditor'

export function TapuscritView({ filtered }: { filtered: Entry[] }) {
  const isAdmin = useIsAdmin()
  const { openActions } = useEntryUi()
  const { props: dragProps } = useDragReorder()
  const [hovered, setHovered] = useState<Entry | null>(null)
  const hoveredImage = hovered ? resolveImageUrl(hovered.image) : null

  return (
    <main id="tapuscritView" className="tapuscrit-layout">
      <div className="tapuscrit-split-container">
        <div className="tapuscrit-photo-side">
          <div className="sticky-photo-wrapper">
            {!hovered ? (
              <div className="photo-placeholder">[ SURVOLER UNE ENTRÉE AVEC IMAGE ]</div>
            ) : hoveredImage ? (
              <img src={hoveredImage} alt={hovered.title} />
            ) : (
              <div className="photo-placeholder">[ PAS D'IMAGE POUR CETTE ENTRÉE ]</div>
            )}
          </div>
        </div>

        <div className="tapuscrit-text-side" id="tapuscritScrollContainer">
          <div className="tapuscrit-stream">
            {filtered.map((entry) => (
              <article
                key={entry.id}
                className="tapuscrit-block"
                data-id={entry.id}
                onMouseEnter={() => setHovered(entry)}
                {...dragProps(entry.id)}
              >
                <div className="tapuscrit-meta">
                  <div className="tapuscrit-meta-left">
                    {isAdmin && <span className="drag-handle" aria-hidden="true">:::</span>}
                    <span>
                      [ {entry.type} ] // {entry.date}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      className="btn-options-dots"
                      aria-label="Options"
                      onClick={() => openActions(entry.id)}
                    >
                      ...
                    </button>
                  )}
                </div>
                <h3>{entry.title}</h3>
                <EntryBody entry={entry} />
              </article>
            ))}
          </div>

          {isAdmin && <QuickEditor />}
        </div>
      </div>
    </main>
  )
}
