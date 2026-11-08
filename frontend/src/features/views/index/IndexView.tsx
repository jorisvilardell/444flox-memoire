import { useEffect, useRef, useState } from 'react'
import { accentAt, isBlack } from '../../../shared/palette'
import { EntryDetail } from '../../entries/EntryDetail'
import type { Entry } from '../../entries/types'
import { useDragReorder } from '../../entries/useDragReorder'
import type { CSSProperties } from 'react'

export function IndexView({ entries, filtered }: { entries: Entry[]; filtered: Entry[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const listRef = useRef<HTMLElement>(null)
  const { isAdmin, props: dragProps } = useDragReorder()

  // Newest (last position) first, as in the mockup.
  const ordered = filtered.slice().reverse()
  const active = filtered.find((e) => e.id === activeId) ?? null

  useEffect(() => {
    const root = listRef.current
    if (!root) return
    const wrappers = root.querySelectorAll<HTMLElement>('.list-item-wrapper')
    if (wrappers.length === 0) return
    const observer = new IntersectionObserver(
      (obs) => {
        for (const o of obs) {
          if (o.isIntersecting && o.target instanceof HTMLElement && o.target.dataset.id) {
            setActiveId(o.target.dataset.id)
          }
        }
      },
      { root, rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    wrappers.forEach((w) => observer.observe(w))
    return () => observer.disconnect()
  }, [filtered])

  return (
    <main id="menuView" className="split-layout">
      <section className="list-column" id="indexList" ref={listRef}>
        <ul id="dynamicList">
          {ordered.map((entry, index) => {
            const accent = accentAt(index)
            const style = { '--hover-cmyk': accent.color, '--hover-glow': accent.glow } as CSSProperties
            return (
              <li
                key={entry.id}
                className="list-item-wrapper"
                data-id={entry.id}
                {...dragProps(entry.id)}
              >
                {isAdmin && <span className="drag-handle" aria-hidden="true">:::</span>}
                <button
                  type="button"
                  className={`list-item${entry.id === activeId ? ' active' : ''}`}
                  data-id={entry.id}
                  data-cmyk={isBlack(accent) ? 'black' : undefined}
                  style={style}
                  onClick={(e) => {
                    e.currentTarget.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    setActiveId(entry.id)
                  }}
                >
                  {entry.title}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="preview-column">
        <div className="preview-wrapper" id="previewPane">
          {filtered.length === 0 ? (
            <div className="empty-state">
              {entries.length === 0 ? "En attente d'une nouvelle entrée" : 'Aucune entrée ne correspond à la recherche'}
            </div>
          ) : active ? (
            <EntryDetail entry={active} />
          ) : (
            <div className="empty-state">En attente d'une nouvelle entrée</div>
          )}
        </div>
      </section>
    </main>
  )
}
