import { Navigate } from '@/features/Navigate'
import styles from './index.module.css'

export const TopPage = () => {
  return (
    <div className={styles.page}>
      <Navigate />
    </div>
  )
}

export default TopPage
