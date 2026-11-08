import { useEffect, useRef, useState } from 'react'
import { EMPTY_FILTERS, hasFilters, type SearchFilters } from '../entries/filter'
import { ENTRY_TYPES, type Entry } from '../entries/types'

interface SearchBarProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
  results: Entry[]
  onSelect: (id: string) => void
}

export function SearchBar({ filters, onChange, results, onSelect }: SearchBarProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const active = hasFilters(filters)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && e.target instanceof Node && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const update = (patch: Partial<SearchFilters>) => {
    onChange({ ...filters, ...patch })
    setOpen(true)
  }

  return (
    <div className="search-container" id="searchContainer" ref={containerRef}>
      <div className="search-bar">
        <input
          type="text"
          id="searchInput"
          aria-label="Rechercher"
          placeholder="RECHERCHER TITRE, CONTENU, TAGS..."
          autoComplete="off"
          value={filters.text}
          onChange={(e) => update({ text: e.target.value })}
        />
        <select
          className="search-select"
          aria-label="Type d'entrée"
          value={filters.type}
          onChange={(e) => update({ type: e.target.value })}
        >
          <option value="">TYPE (TOUS)</option>
          {ENTRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="search-date-input"
          aria-label="Date"
          placeholder="DATE (JJ/MM/AAAA)"
          autoComplete="off"
          value={filters.date}
          onChange={(e) => update({ date: e.target.value })}
        />
        {active && (
          <button
            type="button"
            className="search-clear-btn"
            title="Effacer la recherche"
            aria-label="Effacer la recherche"
            onClick={() => {
              onChange(EMPTY_FILTERS)
              setOpen(false)
            }}
          >
            ✕
          </button>
        )}
      </div>

      {open && active && (
        <div className="search-suggestions">
          {results.length === 0 ? (
            <div className="suggestion-no-result">AUCUN RÉSULTAT TROUVÉ</div>
          ) : (
            results.map((entry) => (
              <button
                type="button"
                key={entry.id}
                className="suggestion-item"
                onClick={() => {
                  setOpen(false)
                  onSelect(entry.id)
                }}
              >
                <span className="suggestion-title">{entry.title}</span>
                <span className="suggestion-meta">
                  <span className="suggestion-tag">{entry.type}</span>
                  <span className="suggestion-date">{entry.date}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
