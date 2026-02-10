import styles from './index.module.css'

type SeedInputProps = {
  seed: string
  onSeedChange: (seed: string) => void
  onGenerateRandom: () => void
}

export const SeedInput = ({ seed, onSeedChange, onGenerateRandom }: SeedInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // 数字のみ許可
    if (value === '' || /^\d+$/.test(value)) {
      onSeedChange(value)
    }
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>シード値</h3>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={seed}
          onChange={handleChange}
          placeholder="シード値を入力"
          className={styles.input}
        />
        <button onClick={onGenerateRandom} className={styles.randomButton}>
          ランダム生成
        </button>
      </div>
    </div>
  )
}
