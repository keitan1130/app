import { useEffect } from 'react'
import sougen from '@/assets/sougen.png'
import styles from './index.module.css'

export const SupikiRanch = () => {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  return (
    <div
      className={styles.root}
      style={{ backgroundImage: `url(${sougen})` }}
      role="img"
      aria-label="背景画像"
    />
  )
}
