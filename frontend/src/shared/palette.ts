export interface Accent {
  color: string
  glow: string
}

export const CMYK_PALETTE: readonly Accent[] = [
  { color: '#00e5ff', glow: '0 0 5px rgba(0, 229, 255, 0.2)' },
  { color: '#ff0055', glow: '0 0 5px rgba(255, 0, 85, 0.2)' },
  { color: '#ffea00', glow: '0 0 5px rgba(255, 234, 0, 0.25)' },
  { color: '#111111', glow: '0 0 5px rgba(17, 17, 17, 0.12)' },
]

export const CURSOR_PALETTE: readonly Accent[] = [
  { color: '#00e5ff', glow: '0 0 10px rgba(0, 229, 255, 0.4)' },
  { color: '#ff0055', glow: '0 0 10px rgba(255, 0, 85, 0.4)' },
  { color: '#ffea00', glow: '0 0 10px rgba(255, 234, 0, 0.5)' },
  { color: '#111111', glow: '0 0 10px rgba(17, 17, 17, 0.3)' },
]

export function accentAt(index: number): Accent {
  return CMYK_PALETTE[index % CMYK_PALETTE.length] ?? CMYK_PALETTE[0]!
}

export function isBlack(accent: Accent): boolean {
  return accent.color === '#111111'
}
