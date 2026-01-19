import supikiImage from '@/assets/supiki.png'
import React from 'react'
import styles from './index.module.css'

interface SupikiModelProps {
  x: number
  y: number
  direction: 'left' | 'right'
  isMoving: boolean
  onClick: () => void
}

export const SupikiModel: React.FC<SupikiModelProps> = ({ x, y, direction, isMoving, onClick }) => {
  const imageClassName = isMoving
    ? `${styles['supiki-model__image']} ${styles['supiki-model__image--walking']}`
    : styles['supiki-model__image']

  return (
    <div
      className={styles['supiki-model']}
      style={{
        left: x,
        top: y,
        transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
      }}
      onClick={onClick}
    >
      <img src={supikiImage} alt="Supiki" className={imageClassName} />
    </div>
  )
}
