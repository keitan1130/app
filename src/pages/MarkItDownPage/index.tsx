import { MarkItDown } from '@/features/MarkItDown'
import styles from './index.module.css'

export const MarkItDownPage = () => {
  return (
    <div className={styles.page}>
      <MarkItDown />
    </div>
  )
}

export default MarkItDownPage
