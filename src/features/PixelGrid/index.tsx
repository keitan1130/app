import { useMemo, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import styles from './index.module.css'

type GridSize = 32

const createCells = (size: GridSize) => Array.from({ length: size * size }, () => '#ffffff')

export const PixelGrid = () => {
  const [gridSize] = useState<GridSize>(32)
  const [cells, setCells] = useState<string[]>(() => createCells(32))
  const [selectedColor, setSelectedColor] = useState('#111827')
  const [colorInput, setColorInput] = useState('111827')
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const boardStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
    }),
    [gridSize]
  )

  const handlePaintCell = (index: number) => {
    setCells((prev) => {
      if (prev[index] === selectedColor) return prev
      const next = [...prev]
      next[index] = selectedColor
      return next
    })
  }

  const handleColorInput = (value: string) => {
    const normalized = value
      .replace(/[^0-9a-fA-F]/g, '')
      .slice(0, 6)
      .toUpperCase()
    setColorInput(normalized)
    if (normalized.length === 6) {
      setSelectedColor(`#${normalized}`)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.boardArea}>
        <aside className={styles.paletteDock} aria-label="色変更メニュー">
          <button
            type="button"
            className={styles.currentColorButton}
            onClick={() => setIsPickerOpen((prev) => !prev)}
            aria-label="色変更パネルを開く"
            aria-expanded={isPickerOpen}
          >
            <span className={styles.currentColorDot} style={{ backgroundColor: selectedColor }} />
            <span className={styles.currentColorCode}>{selectedColor.toUpperCase()}</span>
          </button>

          {isPickerOpen && (
            <div className={styles.pickerPanel}>
              <HexColorPicker
                color={selectedColor}
                onChange={(next) => {
                  setSelectedColor(next)
                  setColorInput(next.slice(1).toUpperCase())
                }}
              />
              <label className={styles.colorInputWrap}>
                <span className={styles.hashPrefix}>#</span>
                <input
                  type="text"
                  className={styles.colorInput}
                  value={colorInput}
                  onChange={(e) => handleColorInput(e.target.value)}
                  placeholder="RRGGBB"
                  aria-label="色コード入力"
                  inputMode="text"
                />
              </label>
            </div>
          )}
        </aside>

        <div
          className={styles.board}
          style={boardStyle}
          role="grid"
          aria-label="方眼ペイントボード"
        >
          {cells.map((color, index) => (
            <button
              type="button"
              key={index}
              role="gridcell"
              className={styles.cell}
              style={{ backgroundColor: color }}
              onClick={() => handlePaintCell(index)}
              aria-label={`セル ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
