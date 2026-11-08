import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  title: string
  zIndex: number
  onClose: () => void
  children: ReactNode
  className?: string
  maxWidth?: number
}

export function Modal({ title, zIndex, onClose, children, className = '', maxWidth }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    ref.current?.focus()
    return () => previous?.focus()
  }, [])

  return (
    <div
      className="modal"
      style={{ zIndex }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          onClose()
        }
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`modal-content ${className}`}
        style={maxWidth ? { maxWidth } : undefined}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            FERMER
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
