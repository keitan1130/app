import type React from 'react'
import styles from '../index.module.css'
import type { InputMode } from '../types'
import { formatBytes } from '../utils/markitdownSource'

type InputSectionProps = {
  inputMode: InputMode
  selectedFile: File | null
  manualInput: string
  isDragOver: boolean
  selectedFileLabel: string
  fileAccept: string
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void
  onDropzoneClick: () => void
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onManualInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export const InputSection = ({
  inputMode,
  selectedFile,
  manualInput,
  isDragOver,
  selectedFileLabel,
  fileAccept,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onDropzoneClick,
  onFileChange,
  onManualInputChange,
}: InputSectionProps) => {
  return (
    <div className={styles.inputSection}>
      <h3 className={styles.title}>入力ソース</h3>
      {inputMode === 'file' ? (
        // biome-ignore lint/a11y/useSemanticElements: ファイル入力とファイル情報を含むため button 要素にはできない。
        <div
          className={`${styles.dropzone} ${isDragOver ? styles.dragOver : ''}`}
          role="button"
          tabIndex={0}
          aria-label="入力ファイルを選択"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onDropzoneClick}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onDropzoneClick()
            }
          }}
        >
          {selectedFile ? (
            <div className={styles.fileCard}>
              <p className={styles.fileCardName}>{selectedFile.name}</p>
              <p className={styles.fileCardMeta}>{formatBytes(selectedFile.size)}</p>
            </div>
          ) : (
            <div className={styles.placeholder}>
              <p>ここにファイルをドラッグ＆ドロップ</p>
              <p>または クリックして選択</p>
              <p>
                ファイル情報はmarkdownに変換された後に削除されますが送るファイルに個人情報が含まないようにしてください
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={fileAccept}
            className={styles.fileInput}
            onChange={onFileChange}
          />
        </div>
      ) : (
        <textarea
          className={styles.manualInput}
          value={manualInput}
          onChange={onManualInputChange}
          placeholder="HTML / CSV / JSON / XML テキストを入力"
          rows={12}
        />
      )}
      <p className={styles.fileInfo}>
        選択中: {inputMode === 'file' ? selectedFileLabel : '手入力モード'}
      </p>
    </div>
  )
}
