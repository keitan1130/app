import { BusTimetable } from '@/features/BusTimetable'
import styles from './index.module.css'

export const BusTimetablePage = () => {
  return (
    <div className={styles.page}>
      <BusTimetable />
    </div>
  )
}

export default BusTimetablePage
