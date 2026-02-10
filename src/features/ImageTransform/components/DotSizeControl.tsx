import styles from '../index.module.css'

type DotSizeControlProps = {
  dotSize: number
  onChange: (value: number) => void
  label?: string
  helpText?: string
}

export const DotSizeControl = ({
  dotSize,
  onChange,
  label = 'ドットサイズ',
  helpText = '大きいほど粗いドットになります。',
}: DotSizeControlProps) => {
  return (
    <div className={styles.controlCard}>
      <label className={styles.label} htmlFor="dot-range">
        {label}: {dotSize}
      </label>
      <input
        id="dot-range"
        type="range"
        min={1}
        max={50}
        value={dotSize}
        className={styles.range}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <p className={styles.help}>{helpText}</p>
    </div>
  )
}
