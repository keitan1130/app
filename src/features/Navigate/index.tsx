import { AppMenu } from '@/features/AppMenu'
import styles from './index.module.css'

export const Navigate = () => {
  return (
    <div className={styles.container}>
      <AppMenu isOpen={true} onClose={() => {}} className={styles.menuPopupFixed} />
    </div>
  )
}
