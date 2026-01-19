import styles from './index.module.css'

type ImageOutputProps = {
  outputUrl: string | null
  onDownload: () => void
}

export const ImageOutput = ({ outputUrl, onDownload }: ImageOutputProps) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>出力画像</h3>
      <div className={styles.outputArea}>
        {outputUrl ? (
          <img src={outputUrl} alt="Output" className={styles.outputImage} />
        ) : (
          <div className={styles.placeholder}>
            <p>変換後の画像がここに表示されます</p>
          </div>
        )}
      </div>
      {outputUrl && (
        <button onClick={onDownload} className={styles.downloadButton}>
          ダウンロード
        </button>
      )}
    </div>
  )
}
