import { useState } from 'react'
import { ColorPickerPanel } from './ColorPickerPanel'
import styles from './index.module.css'
import { usePixelGridSync } from './usePixelGridSync'

export const PixelGrid = () => {
  const { boardStyle, cells, errorMessage, paintCell, syncState, version } = usePixelGridSync()
  const [selectedColor, setSelectedColor] = useState('#111827')
  const [colorInput, setColorInput] = useState('111827')
  const [isPickerOpen, setIsPickerOpen] = useState(false)

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
          <ColorPickerPanel
            colorInput={colorInput}
            isOpen={isPickerOpen}
            selectedColor={selectedColor}
            onColorInputChange={handleColorInput}
            onColorSelect={setSelectedColor}
            onToggle={() => setIsPickerOpen((prev) => !prev)}
          />

          <p className={styles.syncStatus} role="status" aria-live="polite">
            {syncState === 'loading' && '同期中...'}
            {syncState === 'saving' && '保存中...'}
            {syncState === 'idle' && `version: ${version}`}
            {syncState === 'error' && (errorMessage || '通信エラー')}
          </p>
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
              onClick={() => void paintCell(index, selectedColor)}
              aria-label={`セル ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
