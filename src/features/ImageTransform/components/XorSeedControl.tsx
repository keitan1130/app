import { SeedInput } from '../SeedInput'
import styles from '../index.module.css'

type XorSeedControlProps = {
  seed: string
  onSeedChange: (seed: string) => void
  onGenerateRandom: () => void
}

export const XorSeedControl = ({ seed, onSeedChange, onGenerateRandom }: XorSeedControlProps) => {
  return (
    <div className={styles.controlCard}>
      <SeedInput seed={seed} onSeedChange={onSeedChange} onGenerateRandom={onGenerateRandom} />
      <p className={styles.help}>同じシード値で2回変換すると元に戻ります。</p>
    </div>
  )
}
