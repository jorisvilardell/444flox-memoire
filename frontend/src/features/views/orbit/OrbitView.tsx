import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { accentAt, isBlack } from '../../../shared/palette'
import { useEntryUi } from '../../entries/entry-ui'
import type { Entry } from '../../entries/types'

// Matches the CSS: the ring is min(85vw, 85vh) wide.
function ringRadius() {
  return (Math.min(window.innerWidth, window.innerHeight) * 0.85) / 2
}

export function OrbitView({ filtered }: { filtered: Entry[] }) {
  const { openView } = useEntryUi()
  const ringRef = useRef<HTMLDivElement>(null)
  const [radius, setRadius] = useState(ringRadius)

  useEffect(() => {
    const onResize = () => setRadius(ringRadius())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const setSpeed = (rate: number) => {
    const anim = ringRef.current?.getAnimations()[0]
    if (anim) anim.playbackRate = rate
  }

  const total = filtered.length

  return (
    <main id="orbiterView" className="orbiter-layout">
      <div className="orbit-center-static">
        <img src="/logo/logo-central.svg" alt="Carnet de Bord" className="orbit-bg-logo" />
      </div>
      <div
        ref={ringRef}
        className="orbit-ring-container"
        onMouseEnter={() => setSpeed(0.2)}
        onMouseLeave={() => setSpeed(1)}
      >
        {filtered.map((entry, index) => {
          const r = radius * (1 - (index % 4) * 0.22)
          const angle = (index / total) * 2 * Math.PI
          const accent = accentAt(index)
          const style = { '--hover-cmyk': accent.color, '--hover-glow': accent.glow } as CSSProperties
          return (
            <div
              key={entry.id}
              className="orbit-item"
              style={{ left: `${radius + r * Math.cos(angle)}px`, top: `${radius + r * Math.sin(angle)}px` }}
            >
              <button
                type="button"
                className="orbit-item-content"
                data-cmyk={isBlack(accent) ? 'black' : undefined}
                style={style}
                onClick={() => openView(entry)}
              >
                {entry.title}
              </button>
            </div>
          )
        })}
      </div>
    </main>
  )
}
