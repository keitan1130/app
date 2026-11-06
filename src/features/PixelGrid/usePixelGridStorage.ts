import { useCallback, useRef, useState } from 'react'

const GRID_SIZE = 32
const STORAGE_KEY = 'pixel-grid:v1'
const boardStyle = { gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }
const isValidHexColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[0-9A-F]{6}$/i.test(value)

type GridState = {
  cells: string[]
  saveState: 'idle' | 'saved' | 'error'
  errorMessage: string
}

const loadGrid = (): GridState => {
  const emptyGrid: GridState = {
    cells: Array.from({ length: GRID_SIZE * GRID_SIZE }, () => '#FFFFFF'),
    saveState: 'idle',
    errorMessage: '',
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === null) return emptyGrid

    const data = JSON.parse(stored)
    if (
      data === null ||
      typeof data !== 'object' ||
      data.gridSize !== GRID_SIZE ||
      !Array.isArray(data.cells) ||
      data.cells.length !== GRID_SIZE * GRID_SIZE ||
      !data.cells.every(isValidHexColor)
    ) {
      throw new Error('Invalid saved grid')
    }

    return {
      cells: data.cells.map((color: string) => color.toUpperCase()),
      saveState: 'saved',
      errorMessage: '',
    }
  } catch {
    return {
      ...emptyGrid,
      saveState: 'error',
      errorMessage: '保存データを読み込めませんでした。新しく描くと保存内容が置き換わります。',
    }
  }
}

export const usePixelGridStorage = () => {
  const [grid, setGrid] = useState(loadGrid)
  const cellsRef = useRef(grid.cells)

  const paintCell = useCallback((index: number, selectedColor: string) => {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= GRID_SIZE * GRID_SIZE ||
      !isValidHexColor(selectedColor)
    ) {
      return
    }

    const nextCells = [...cellsRef.current]
    nextCells[index] = selectedColor.toUpperCase()
    cellsRef.current = nextCells

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ gridSize: GRID_SIZE, cells: nextCells })
      )
      setGrid({ cells: nextCells, saveState: 'saved', errorMessage: '' })
    } catch {
      setGrid({
        cells: nextCells,
        saveState: 'error',
        errorMessage: '保存できませんでした。描いた内容はこの画面でのみ保持されます。',
      })
    }
  }, [])

  return { boardStyle, ...grid, paintCell }
}
