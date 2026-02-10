import type { ReactNode } from 'react'
import { useCallback, useRef } from 'react'
import styles from './index.module.css'

type ImageDropzoneProps = {
  onImageSelect: (file: File) => void
  previewUrl: string | null
  title?: string
  placeholder?: ReactNode
}

const defaultPlaceholder = (
  <div>
    <p>ここに画像をドラッグ＆ドロップ</p>
    <p>または クリックして選択</p>
  </div>
)

export const ImageDropzone = ({
  onImageSelect,
  previewUrl,
  title = '入力画像',
  placeholder = defaultPlaceholder,
}: ImageDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (file.type.startsWith('image/')) {
          onImageSelect(file)
        } else {
          alert('画像ファイルのみアップロード可能です')
        }
      }
    },
    [onImageSelect]
  )

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        onImageSelect(file)
      } else {
        alert('画像ファイルのみアップロード可能です')
        e.target.value = ''
      }
    }
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <div
        className={styles.dropzone}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className={styles.preview} />
        ) : (
          <div className={styles.placeholder}>{placeholder}</div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.input}
        />
      </div>
    </div>
  )
}
