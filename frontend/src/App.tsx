import { lazy, Suspense, useMemo, useState } from 'react'
import { AuthControl } from './features/auth/AuthControl'
import { useIsAdmin } from './features/auth/auth.api'
import { useEntries } from './features/entries/entries.api'
import { useEntryUi } from './features/entries/entry-ui'
import { EntryUiProvider } from './features/entries/EntryUiProvider'
import { EMPTY_FILTERS, filterEntries, type SearchFilters } from './features/entries/filter'
import { SearchBar } from './features/search/SearchBar'
import { GalleryView } from './features/views/gallery/GalleryView'
import { IndexView } from './features/views/index/IndexView'
import { ListView } from './features/views/list/ListView'
import { OrbitView } from './features/views/orbit/OrbitView'
import { TapuscritView } from './features/views/tapuscrit/TapuscritView'
import { Cursor } from './shared/Cursor'
import { ToastHost } from './shared/ToastHost'

// The editor stack is heavy; only visitors who open the mémoire download it.
const MemoireView = lazy(() => import('./features/memoire/MemoireView').then((m) => ({ default: m.MemoireView })))

type ViewName = 'index' | 'tapuscrit' | 'orbit' | 'list' | 'gallery' | 'memoire'

const VIEWS: { name: ViewName; label: string; id: string }[] = [
  { name: 'index', label: 'INDEX', id: 'viewMenuBtn' },
  { name: 'tapuscrit', label: 'TAPUSCRIT', id: 'viewTapuscritBtn' },
  { name: 'orbit', label: 'ORBITE', id: 'viewOrbiterBtn' },
  { name: 'list', label: 'LISTE', id: 'viewListBtn' },
  { name: 'gallery', label: 'GALERIE', id: 'viewGalerieBtn' },
  { name: 'memoire', label: 'MÉMOIRE', id: 'viewMemoireBtn' },
]

function Shell() {
  const [view, setView] = useState<ViewName>('index')
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS)
  const { data: entries = [], isPending, isError, error, refetch } = useEntries()
  const { openView, openCreate } = useEntryUi()
  const isAdmin = useIsAdmin()

  const filtered = useMemo(() => filterEntries(entries, filters), [entries, filters])

  const selectEntry = (id: string) => {
    if (view === 'index' || view === 'tapuscrit') {
      const selector = view === 'index' ? `.list-item-wrapper[data-id="${id}"]` : `.tapuscrit-block[data-id="${id}"]`
      document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      const entry = entries.find((e) => e.id === id)
      if (entry) openView(entry)
    }
  }

  let content
  if (view === 'memoire') {
    content = (
      <Suspense fallback={<div className="status-screen">CHARGEMENT...</div>}>
        <MemoireView />
      </Suspense>
    )
  } else if (isPending) {
    content = <div className="status-screen">CHARGEMENT...</div>
  } else if (isError) {
    content = (
      <div className="status-screen" role="alert">
        <span>IMPOSSIBLE DE CHARGER LES ENTRÉES ({error.message})</span>
        <button type="button" className="btn-secondary" onClick={() => refetch()}>
          RÉESSAYER
        </button>
      </div>
    )
  } else if (view === 'index') {
    content = <IndexView entries={entries} filtered={filtered} />
  } else if (view === 'tapuscrit') {
    content = <TapuscritView filtered={filtered} />
  } else if (view === 'orbit') {
    content = <OrbitView filtered={filtered} />
  } else if (view === 'list') {
    content = <ListView filtered={filtered} />
  } else {
    content = <GalleryView filtered={filtered} />
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <img src="/logo/logo-gauche.svg" alt="Carnet de Bord" className="brand-logo" />
        </div>

        <SearchBar filters={filters} onChange={setFilters} results={filtered} onSelect={selectEntry} />

        <nav className="view-switcher">
          {VIEWS.map((v) => (
            <button
              key={v.name}
              id={v.id}
              type="button"
              className={`nav-btn${view === v.name ? ' active' : ''}`}
              aria-pressed={view === v.name}
              onClick={() => setView(v.name)}
            >
              {v.label}
            </button>
          ))}
        </nav>

        <div className="topbar-actions">
          <AuthControl />
          {isAdmin && (
            <button type="button" className="btn-primary" onClick={openCreate}>
              [ + ]
            </button>
          )}
        </div>
      </header>

      {content}
      <ToastHost />
      <Cursor />
    </>
  )
}

export default function App() {
  return (
    <EntryUiProvider>
      <Shell />
    </EntryUiProvider>
  )
}
