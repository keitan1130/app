import { HexColorPicker } from 'react-colorful'
import styles from './index.module.css'

type ColorPickerPanelProps = {
  colorInput: string
  isOpen: boolean
  selectedColor: string
  onColorInputChange: (value: string) => void
  onColorSelect: (value: string) => void
  onToggle: () => void
}

export const ColorPickerPanel = ({
  colorInput,
  isOpen,
  selectedColor,
  onColorInputChange,
  onColorSelect,
  onToggle,
}: ColorPickerPanelProps) => {
  return (
    <>
      <button
        type="button"
        className={styles.currentColorButton}
        onClick={onToggle}
        aria-label="色変更パネルを開く"
        aria-expanded={isOpen}
      >
        <span className={styles.currentColorDot} style={{ backgroundColor: selectedColor }} />
        <span className={styles.currentColorCode}>{selectedColor.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className={styles.pickerPanel}>
          <HexColorPicker
            color={selectedColor}
            onChange={(next) => {
              onColorSelect(next)
              onColorInputChange(next.slice(1).toUpperCase())
            }}
          />
          <label className={styles.colorInputWrap}>
            <span className={styles.hashPrefix}>#</span>
            <input
              type="text"
              className={styles.colorInput}
              value={colorInput}
              onChange={(e) => onColorInputChange(e.target.value)}
              placeholder="RRGGBB"
              aria-label="色コード入力"
              inputMode="text"
            />
          </label>
        </div>
      )}
    </>
  )
}
