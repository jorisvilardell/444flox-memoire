import { useEffect, useMemo, useRef } from 'react'
import { resolveImageUrl } from '../../../shared/api-client'
import { useEntryUi } from '../../entries/entry-ui'
import type { Entry } from '../../entries/types'

const LERP = 0.08
// Scroll distance (px) that moves one image: a mouse notch (~100-120px) is one image,
// a trackpad gesture spreads over several events instead of firing one step per event.
const WHEEL_PX_PER_ITEM = 115
// One event never moves more than one image, so large deltas cannot skip past several.
const MAX_STEP_PER_EVENT = 1
const TOUCH_STEP = 0.018
// Once input stops, the target settles on the nearest image in the direction of travel.
const SNAP_DELAY_MS = 180
const SNAP_THRESHOLD = 0.3

/** Rounds toward the travel direction, ignoring drifts smaller than SNAP_THRESHOLD. */
function snapIndex(value: number, direction: number) {
  if (direction > 0) return Math.ceil(value - SNAP_THRESHOLD)
  if (direction < 0) return Math.floor(value + SNAP_THRESHOLD)
  return Math.round(value)
}

function wheelPixels(e: WheelEvent) {
  if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) return e.deltaY * 33
  if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) return e.deltaY * window.innerHeight
  return e.deltaY
}

export function GalleryView({ filtered }: { filtered: Entry[] }) {
  const { openView } = useEntryUi()
  const viewRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const target = useRef(0)
  const current = useRef(0)
  const snapTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const items = useMemo(
    () =>
      filtered.flatMap((entry) => {
        const src = resolveImageUrl(entry.image)
        return src ? [{ entry, src }] : []
      }),
    [filtered],
  )
  const count = items.length

  useEffect(() => {
    target.current = Math.floor(count / 2)
    current.current = target.current
  }, [count])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const clamp = (v: number) => Math.max(0, Math.min(v, Math.max(0, count - 1)))

    let direction = 0
    const snap = () => {
      target.current = clamp(snapIndex(target.current, direction))
      direction = 0
    }
    const move = (delta: number) => {
      if (delta === 0) return
      direction = Math.sign(delta)
      target.current = clamp(target.current + delta)
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const step = wheelPixels(e) / WHEEL_PX_PER_ITEM
      move(Math.max(-MAX_STEP_PER_EVENT, Math.min(MAX_STEP_PER_EVENT, step)))
      clearTimeout(snapTimer.current)
      snapTimer.current = setTimeout(snap, SNAP_DELAY_MS)
    }
    let touchY = 0
    const onTouchStart = (e: TouchEvent) => {
      clearTimeout(snapTimer.current)
      touchY = e.touches[0]?.clientY ?? 0
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchY
      move((touchY - y) * TOUCH_STEP)
      touchY = y
    }
    const onKey = (e: KeyboardEvent) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
      if (!step || (e.target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable]')) return
      e.preventDefault()
      target.current = clamp(Math.round(target.current) + step)
    }
    view.addEventListener('wheel', onWheel, { passive: false })
    view.addEventListener('touchstart', onTouchStart, { passive: true })
    view.addEventListener('touchmove', onTouchMove, { passive: true })
    view.addEventListener('touchend', snap)
    window.addEventListener('keydown', onKey)

    let raf = 0
    const frame = () => {
      current.current += (target.current - current.current) * LERP
      const isMobile = window.innerWidth <= 768
      const gapX = isMobile ? 120 : 220
      const gapY = isMobile ? -60 : -110
      const gapZ = isMobile ? 100 : 160

      cardRefs.current.forEach((card, i) => {
        if (!card) return
        const p = i - current.current
        const absP = Math.abs(p)
        let scale = 1
        if (absP < 0.5) {
          card.style.zIndex = '100'
          card.style.filter = 'brightness(1)'
          scale = 1 + (0.5 - absP) * 0.15
        } else {
          card.style.zIndex = String(Math.round(100 - absP * 10))
          card.style.filter = `brightness(${Math.max(0.3, 1 - absP * 0.15)})`
        }
        card.style.opacity = String(Math.max(0, 1 - absP * 0.18))
        card.style.transform = `translate3d(${p * gapX}px, ${p * gapY}px, ${-absP * gapZ}px) rotateX(5deg) rotateY(${p * -12}deg) scale(${scale})`
      })
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(snapTimer.current)
      view.removeEventListener('wheel', onWheel)
      view.removeEventListener('touchstart', onTouchStart)
      view.removeEventListener('touchmove', onTouchMove)
      view.removeEventListener('touchend', snap)
      window.removeEventListener('keydown', onKey)
    }
  }, [count])

  return (
    <main id="galerieView" className="galerie-layout" ref={viewRef}>
      <div className="galerie-3d-container">
        {count === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontFamily: "'TitleFont'", fontSize: '1.5rem' }}>
            AUCUNE IMAGE TROUVÉE
          </div>
        ) : (
          items.map(({ entry, src }, i) => (
            <div
              key={entry.id}
              className="galerie-card"
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              onClick={() => {
                // A pending wheel snap would otherwise override the clicked image.
                clearTimeout(snapTimer.current)
                if (Math.abs(target.current - i) < 0.2) openView(entry)
                else target.current = i
              }}
            >
              <img src={src} alt={entry.title} draggable={false} />
            </div>
          ))
        )}
      </div>
      <div className="galerie-scroll-hint">[ SCROLLER POUR NAVIGUER ]</div>
    </main>
  )
}
