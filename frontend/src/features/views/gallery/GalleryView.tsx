import { useEffect, useMemo, useRef } from 'react'
import { resolveImageUrl } from '../../../shared/api-client'
import { useEntryUi } from '../../entries/entry-ui'
import type { Entry } from '../../entries/types'

const LERP = 0.08
// The mockup registered its wheel handler twice, so one notch moved 0.8.
const WHEEL_STEP = 0.8
const TOUCH_STEP = 0.015

export function GalleryView({ filtered }: { filtered: Entry[] }) {
  const { openView } = useEntryUi()
  const viewRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const target = useRef(0)
  const current = useRef(0)

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

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      target.current = clamp(target.current + Math.sign(e.deltaY) * WHEEL_STEP)
    }
    let touchY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0
    }
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchY
      target.current = clamp(target.current + (touchY - y) * TOUCH_STEP)
      touchY = y
    }
    view.addEventListener('wheel', onWheel, { passive: false })
    view.addEventListener('touchstart', onTouchStart, { passive: true })
    view.addEventListener('touchmove', onTouchMove, { passive: true })

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
      view.removeEventListener('wheel', onWheel)
      view.removeEventListener('touchstart', onTouchStart)
      view.removeEventListener('touchmove', onTouchMove)
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
