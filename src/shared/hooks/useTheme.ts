import { useEffect, useRef, useState } from 'react'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'theme'

const isTheme = (value: string | null): value is Theme => value === 'light' || value === 'dark'

const getSystemTheme = (): Theme => {
  if (!window.matchMedia) return 'dark'

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const readStoredTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return isTheme(stored) ? stored : getSystemTheme()
}

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
}

const TILE_GRID_SIZE = 15
const TILE_FADE_DURATION_MS = 320
const TILE_MAX_DELAY_MS = 260
const TILE_JITTER_MS = 60

type DelayPattern =
  | 'random'
  | 'left-to-right'
  | 'right-to-left'
  | 'top-to-bottom'
  | 'bottom-to-top'
  | 'row-zigzag'
  | 'col-zigzag'
  | 'center-out'
  | 'edge-in'

const pickDelayPattern = (): DelayPattern => {
  const patterns: DelayPattern[] = [
    'random',
    'left-to-right',
    'right-to-left',
    'top-to-bottom',
    'bottom-to-top',
    'row-zigzag',
    'col-zigzag',
    'center-out',
    'edge-in',
  ]

  return patterns[Math.floor(Math.random() * patterns.length)]
}

const normalize = (value: number, maxValue: number) => (maxValue === 0 ? 0 : value / maxValue)

const getTileOrder = (row: number, col: number, pattern: DelayPattern) => {
  const maxIndex = TILE_GRID_SIZE - 1
  const rowReverse = maxIndex - row
  const colReverse = maxIndex - col

  switch (pattern) {
    case 'left-to-right':
      return normalize(col, maxIndex)
    case 'right-to-left':
      return normalize(colReverse, maxIndex)
    case 'top-to-bottom':
      return normalize(row, maxIndex)
    case 'bottom-to-top':
      return normalize(rowReverse, maxIndex)
    case 'row-zigzag': {
      const zigCol = row % 2 === 0 ? col : colReverse
      return normalize(row * TILE_GRID_SIZE + zigCol, TILE_GRID_SIZE * TILE_GRID_SIZE - 1)
    }
    case 'col-zigzag': {
      const zigRow = col % 2 === 0 ? row : rowReverse
      return normalize(col * TILE_GRID_SIZE + zigRow, TILE_GRID_SIZE * TILE_GRID_SIZE - 1)
    }
    case 'center-out': {
      const center = maxIndex / 2
      const dist = Math.hypot(row - center, col - center)
      const maxDist = Math.hypot(center, center)
      return normalize(dist, maxDist)
    }
    case 'edge-in': {
      const center = maxIndex / 2
      const dist = Math.hypot(row - center, col - center)
      const maxDist = Math.hypot(center, center)
      return 1 - normalize(dist, maxDist)
    }
    case 'random':
    default:
      return Math.random()
  }
}

const createThemeTransitionOverlay = (color: string) => {
  const container = document.createElement('div')
  container.setAttribute('data-theme-transition', 'true')
  Object.assign(container.style, {
    position: 'fixed',
    inset: '0',
    display: 'grid',
    gridTemplateColumns: `repeat(${TILE_GRID_SIZE}, 1fr)`,
    gridTemplateRows: `repeat(${TILE_GRID_SIZE}, 1fr)`,
    pointerEvents: 'none',
    zIndex: '2147483000',
  })

  const tiles: HTMLDivElement[] = []
  const pattern = pickDelayPattern()
  const totalTiles = TILE_GRID_SIZE * TILE_GRID_SIZE
  for (let i = 0; i < totalTiles; i += 1) {
    const tile = document.createElement('div')
    const row = Math.floor(i / TILE_GRID_SIZE)
    const col = i % TILE_GRID_SIZE
    const order = getTileOrder(row, col, pattern)
    const delay = order * TILE_MAX_DELAY_MS + Math.random() * TILE_JITTER_MS
    Object.assign(tile.style, {
      backgroundColor: color,
      opacity: '1',
      transition: `opacity ${TILE_FADE_DURATION_MS}ms ease`,
      transitionDelay: `${delay}ms`,
      willChange: 'opacity',
    })
    container.appendChild(tile)
    tiles.push(tile)
  }

  document.body.appendChild(container)

  const rafId = requestAnimationFrame(() => {
    tiles.forEach((tile) => {
      tile.style.opacity = '0'
    })
  })

  const cleanupDelay = TILE_FADE_DURATION_MS + TILE_MAX_DELAY_MS + 80
  const cleanupTimer = window.setTimeout(() => {
    container.remove()
  }, cleanupDelay)

  return () => {
    cancelAnimationFrame(rafId)
    window.clearTimeout(cleanupTimer)
    container.remove()
  }
}

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme())
  const prevThemeRef = useRef<Theme | null>(null)
  const overlayCleanupRef = useRef<null | (() => void)>(null)
  const isMountedRef = useRef(false)

  useEffect(() => {
    if (isMountedRef.current && prevThemeRef.current && prevThemeRef.current !== theme) {
      if (overlayCleanupRef.current) overlayCleanupRef.current()

      const oldBackground = getComputedStyle(document.documentElement)
        .getPropertyValue('--background-color')
        .trim()

      const fallbackColor = prevThemeRef.current === 'dark' ? '#000000' : '#ffffff'
      overlayCleanupRef.current = createThemeTransitionOverlay(oldBackground || fallbackColor)
    }

    applyTheme(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    prevThemeRef.current = theme
    isMountedRef.current = true
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return { theme, setTheme, toggleTheme }
}
