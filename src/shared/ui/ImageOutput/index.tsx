import type { ReactNode } from 'react'
import styles from './index.module.css'

type ImageOutputProps = {
  outputUrl: string | null
  onDownload: () => void
  title?: string
  placeholder?: ReactNode
  downloadLabel?: string
}

const defaultPlaceholder = (
  <div>
    <p>変換後の画像がここに表示されます</p>
  </div>
)

export const ImageOutput = ({
  outputUrl,
  onDownload,
  title = '出力画像',
  placeholder = defaultPlaceholder,
  downloadLabel = 'ダウンロード',
}: ImageOutputProps) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.outputArea}>
        {outputUrl ? (
          <img src={outputUrl} alt="Output" className={styles.outputImage} />
        ) : (
          <div className={styles.placeholder}>{placeholder}</div>
        )}
      </div>
      {outputUrl && (
        <button onClick={onDownload} className={styles.downloadButton}>
          {downloadLabel}
        </button>
      )}
    </div>
  )
}
