import { ConvertButton } from '../ConvertButton'
import styles from '../index.module.css'

type ConvertActionProps = {
  onClick: () => void
  disabled: boolean
  isProcessing: boolean
}

export const ConvertAction = ({ onClick, disabled, isProcessing }: ConvertActionProps) => {
  return (
    <div className={styles.controlCard}>
      <ConvertButton onClick={onClick} disabled={disabled} isProcessing={isProcessing} />
    </div>
  )
}
