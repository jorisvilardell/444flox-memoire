import { useEffect, useRef } from 'react'
import { CURSOR_PALETTE } from './palette'

const HOVER_SELECTOR =
  'a, button, input, select, textarea, .list-item, .orbit-item-content, .list-table-row, .galerie-card, .galerie-card img'

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let colorIndex = 0

    const onMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
    }
    const onDown = () => {
      document.body.classList.add('cursor-active')
      colorIndex = (colorIndex + 1) % CURSOR_PALETTE.length
      const current = CURSOR_PALETTE[colorIndex]
      if (current) {
        el.style.backgroundColor = current.color
        el.style.boxShadow = current.glow
      }
    }
    const onUp = () => document.body.classList.remove('cursor-active')
    const onOver = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.matches(HOVER_SELECTOR)) document.body.classList.add('cursor-hover')
    }
    const onOut = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.matches(HOVER_SELECTOR)) document.body.classList.remove('cursor-hover')
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  return <div ref={ref} className="custom-cursor" aria-hidden="true" />
}
