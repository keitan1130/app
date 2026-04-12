import { MenuItem, MenuPopup } from '@/shared/ui'
import styles from '../index.module.css'
import type { InputMode, SourceType } from '../types'

type ControlSectionProps = {
  modeLabel: string
  isModeMenuOpen: boolean
  detectedSourceType: SourceType
  isConvertDisabled: boolean
  isConverting: boolean
  errorMessage: string
  supportedFormats: string[]
  onToggleModeMenu: () => void
  onCloseModeMenu: () => void
  onModeChange: (mode: InputMode) => void
  onConvert: () => void
}

export const ControlSection = ({
  modeLabel,
  isModeMenuOpen,
  detectedSourceType,
  isConvertDisabled,
  isConverting,
  errorMessage,
  supportedFormats,
  onToggleModeMenu,
  onCloseModeMenu,
  onModeChange,
  onConvert,
}: ControlSectionProps) => {
  return (
    <div className={styles.controlSection}>
      <h3 className={styles.title}>変換設定</h3>
      <div className={styles.controlPanel}>
        <div className={styles.controlCard}>
          <label className={styles.label} htmlFor="source-mode-button">
            入力方式
          </label>
          <div className={styles.modeMenu}>
            <button
              id="source-mode-button"
              type="button"
              className={styles.modeMenuButton}
              aria-expanded={isModeMenuOpen}
              aria-controls="source-mode-popup"
              onClick={onToggleModeMenu}
            >
              {modeLabel}
            </button>
            <MenuPopup
              id="source-mode-popup"
              isOpen={isModeMenuOpen}
              onClose={onCloseModeMenu}
              className={styles.modeMenuPopup}
              variant="inline"
            >
              <MenuItem onClick={() => onModeChange('file')}>ファイルを選択</MenuItem>
              <MenuItem onClick={() => onModeChange('manual')}>手入力（URL / テキスト）</MenuItem>
            </MenuPopup>
          </div>
        </div>

        <div className={styles.controlCard}>
          <p className={styles.label}>自動判定</p>
          <div className={styles.detectedType}>
            <span className={styles.typeBadge}>{detectedSourceType.label}</span>
            <p className={styles.typeDetail}>{detectedSourceType.detail}</p>
          </div>
        </div>

        <button
          type="button"
          className={styles.convertButton}
          disabled={isConvertDisabled}
          onClick={onConvert}
        >
          {isConverting ? '変換中...' : 'Markdownへ変換'}
        </button>
        {errorMessage && (
          <p className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
        )}
        <p className={styles.label}>対応形式</p>
        <ul className={styles.formatList}>
          {supportedFormats.map((format) => (
            <li key={format}>{format}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
