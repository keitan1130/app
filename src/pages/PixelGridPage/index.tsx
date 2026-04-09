import { PixelGrid } from '@/features/PixelGrid'
import styles from './index.module.css'

export const PixelGridPage = () => {
  return (
    <div className={styles.page}>
      <PixelGrid />
    </div>
  )
}

export default PixelGridPage
