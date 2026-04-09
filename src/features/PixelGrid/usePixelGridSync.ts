import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchGrid, type GridResponse, type GridSize, updateCell } from './PixelGridApi'

export type SyncState = 'loading' | 'idle' | 'saving' | 'error'

const GRID_SIZE: GridSize = 32
const CANVAS_ID = 'global'
const POLL_INTERVAL_MS = 2000

const createCells = (size: GridSize) => Array.from({ length: size * size }, () => '#FFFFFF')
const isValidHexColor = (value: string) => /^#[0-9A-F]{6}$/.test(value)

export const usePixelGridSync = () => {
  const [cells, setCells] = useState<string[]>(() => createCells(GRID_SIZE))
  const [version, setVersion] = useState(0)
  const [syncState, setSyncState] = useState<SyncState>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  const boardStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
    }),
    []
  )

  const applyGrid = useCallback((payload: GridResponse) => {
    if (payload.grid_size !== GRID_SIZE) {
      throw new Error(`unsupported_grid_size:${payload.grid_size}`)
    }

    if (!Array.isArray(payload.cells) || payload.cells.length !== GRID_SIZE * GRID_SIZE) {
      throw new Error('invalid_cells_length')
    }

    const normalizedCells = payload.cells.map((color) => {
      const normalized = color.toUpperCase()
      return isValidHexColor(normalized) ? normalized : '#FFFFFF'
    })

    setCells(normalizedCells)
    setVersion(payload.version)
  }, [])

  const loadGrid = useCallback(
    async (silent = false) => {
      if (!silent) {
        setSyncState('loading')
      }

      try {
        const data = await fetchGrid(CANVAS_ID)
        applyGrid(data)
        setSyncState('idle')
        setErrorMessage('')
      } catch {
        setSyncState('error')
        setErrorMessage('同期に失敗しました')
      }
    },
    [applyGrid]
  )

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void loadGrid(false)
    }, 0)

    const timer = window.setInterval(() => {
      void loadGrid(true)
    }, POLL_INTERVAL_MS)

    return () => {
      window.clearTimeout(initialTimer)
      window.clearInterval(timer)
    }
  }, [loadGrid])

  const paintCell = useCallback(
    async (index: number, selectedColor: string) => {
      const nextColor = selectedColor.toUpperCase()
      const currentColor = cells[index]
      if (currentColor === nextColor) {
        return
      }

      const requestVersion = version

      setCells((prev) => {
        const next = [...prev]
        next[index] = nextColor
        return next
      })
      setSyncState('saving')

      try {
        const result = await updateCell({
          id: CANVAS_ID,
          index,
          color: nextColor,
          if_match_version: requestVersion,
        })

        if (result.kind === 'conflict') {
          await loadGrid(true)
          setSyncState('idle')
          return
        }

        setVersion(result.version)
        setSyncState('idle')
        setErrorMessage('')
      } catch {
        setCells((prev) => {
          const next = [...prev]
          next[index] = currentColor
          return next
        })
        setSyncState('error')
        setErrorMessage('保存に失敗しました')
        await loadGrid(true)
      }
    },
    [cells, loadGrid, version]
  )

  return {
    boardStyle,
    cells,
    errorMessage,
    paintCell,
    syncState,
    version,
  }
}
