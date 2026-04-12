import styles from '../index.module.css'

type OutputSectionProps = {
  markdown: string
  outputName: string
  hasResult: boolean
  copied: boolean
  onCopy: () => void
  onDownload: () => void
}

export const OutputSection = ({
  markdown,
  outputName,
  hasResult,
  copied,
  onCopy,
  onDownload,
}: OutputSectionProps) => {
  return (
    <div className={styles.outputSection}>
      <h3 className={styles.title}>変換結果</h3>
      <div className={styles.outputPanel}>
        <textarea
          className={styles.outputArea}
          value={markdown}
          readOnly
          placeholder="ここにMarkdownが表示されます"
          rows={18}
        />
      </div>
      <div className={styles.outputMeta}>
        <p className={styles.outputName}>{outputName}</p>
        <div className={styles.outputActions}>
          <button type="button" onClick={onCopy} disabled={!hasResult}>
            {copied ? 'コピー済み' : 'コピー'}
          </button>
          <button type="button" onClick={onDownload} disabled={!hasResult}>
            .md を保存
          </button>
        </div>
      </div>
    </div>
  )
}
