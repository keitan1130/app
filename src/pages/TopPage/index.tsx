import { ViteTemplate } from '@/features/ViteTemplate'
import styles from './index.module.css'

export const TopPage = () => {
  return (
    <div className={styles.page}>
      <ViteTemplate />
    </div>
  )
}

export default TopPage
