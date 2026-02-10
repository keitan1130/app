import styles from './index.module.css'

type ConvertButtonProps = {
  onClick: () => void
  disabled: boolean
  isProcessing: boolean
}

export const ConvertButton = ({ onClick, disabled, isProcessing }: ConvertButtonProps) => {
  return (
    <div className={styles.container}>
      <button onClick={onClick} disabled={disabled || isProcessing} className={styles.button}>
        {isProcessing ? '変換中...' : '変換する'}
      </button>
    </div>
  )
}
