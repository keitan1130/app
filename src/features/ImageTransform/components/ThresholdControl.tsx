import styles from '../index.module.css'

type ThresholdControlProps = {
  threshold: number
  onChange: (value: number) => void
}

export const ThresholdControl = ({ threshold, onChange }: ThresholdControlProps) => {
  return (
    <div className={styles.controlCard}>
      <label className={styles.label} htmlFor="threshold-range">
        しきい値: {threshold}
      </label>
      <input
        id="threshold-range"
        type="range"
        min={0}
        max={255}
        value={threshold}
        className={styles.range}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
