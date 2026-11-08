import type { CSSProperties } from 'react'
import { useIsAdmin } from '../../auth/auth.api'
import { accentAt, isBlack } from '../../../shared/palette'
import { useEntryUi } from '../../entries/entry-ui'
import type { Entry } from '../../entries/types'

export function ListView({ filtered }: { filtered: Entry[] }) {
  const isAdmin = useIsAdmin()
  const { openView, openActions } = useEntryUi()

  return (
    <main id="listView" className="list-table-layout">
      <div className="list-table-container">
        <header className="list-table-header">
          <div className="col-num">N°</div>
          <div className="col-color">ACCENT</div>
          <div className="col-title">TITRE DE L'ENTRÉE</div>
          <div className="col-category">CATÉGORIE</div>
          <div className="col-date">DATE</div>
          <div className="col-tags">TAGS / MOTS-CLÉS</div>
          <div className="col-actions"></div>
        </header>

        <div className="list-table-body">
          {filtered.length === 0 && (
            <div className="suggestion-no-result" style={{ padding: '3rem' }}>
              AUCUNE ENTRÉE ENREGISTRÉE
            </div>
          )}
          {filtered.map((entry, index) => {
            const accent = accentAt(index)
            const style = { '--row-cmyk': accent.color, '--row-glow': accent.glow } as CSSProperties
            return (
              <div
                key={entry.id}
                className="list-table-row"
                role="button"
                tabIndex={0}
                style={style}
                data-cmyk={isBlack(accent) ? 'black' : undefined}
                onClick={() => openView(entry)}
                onKeyDown={(e) => {
                  if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    openView(entry)
                  }
                }}
              >
                <div className="row-num">{String(index + 1).padStart(2, '0')}</div>
                <div className="col-color">
                  <span className="row-accent-box" style={{ background: accent.color }} />
                </div>
                <div className="row-title">{entry.title}</div>
                <div className="row-category">{entry.type}</div>
                <div className="row-date">{entry.date}</div>
                <div className="row-tags-wrapper">
                  {entry.tags.map((t) => (
                    <span key={t} className="tag-pill">
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="col-actions">
                  {isAdmin && (
                    <button
                      type="button"
                      className="btn-options-dots"
                      aria-label="Options"
                      onClick={(e) => {
                        e.stopPropagation()
                        openActions(entry.id)
                      }}
                    >
                      ...
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
