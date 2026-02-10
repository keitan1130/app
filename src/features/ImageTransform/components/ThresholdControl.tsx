import styles from '../index.module.css'

type ThresholdControlProps = {
  threshold: number
  onChange: (value: number) => void
  label?: string
  min?: number
  max?: number
}

export const ThresholdControl = ({
  threshold,
  onChange,
  label = 'しきい値',
  min = 0,
  max = 255,
}: ThresholdControlProps) => {
  return (
    <div className={styles.controlCard}>
      <label className={styles.label} htmlFor="threshold-range">
        {label}: {threshold}
      </label>
      <input
        id="threshold-range"
        type="range"
        min={min}
        max={max}
        value={threshold}
        className={styles.range}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
