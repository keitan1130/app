import { useState } from 'react'
import { ColorPickerPanel } from './ColorPickerPanel'
import styles from './index.module.css'
import { usePixelGridStorage } from './usePixelGridStorage'

export const PixelGrid = () => {
  const { boardStyle, cells, errorMessage, paintCell, saveState } = usePixelGridStorage()
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [colorInput, setColorInput] = useState('000000')
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

          <p className={styles.saveStatus} role="status" aria-live="polite">
            {saveState === 'idle' && 'このブラウザに自動保存'}
            {saveState === 'saved' && 'このブラウザに保存済み'}
            {saveState === 'error' && errorMessage}
          </p>
        </aside>

        <section className={styles.board} style={boardStyle} aria-label="方眼ペイントボード">
          {cells.map((color, index) => (
            <button
              type="button"
              // biome-ignore lint/suspicious/noArrayIndexKey: セルの固定座標をキーとし、並べ替えや追加削除は行わない。
              key={index}
              className={styles.cell}
              style={{ backgroundColor: color }}
              onClick={() => paintCell(index, selectedColor)}
              aria-label={`セル ${index + 1}`}
            />
          ))}
        </section>
      </div>
    </div>
  )
}
