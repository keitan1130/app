import React from 'react'
import supikiImage from '@/assets/supiki.png'
import './index.module.css'

interface SupikiModelProps {
  x: number
  y: number
  direction: 'left' | 'right'
  isMoving: boolean
  onClick: () => void
}

export const SupikiModel: React.FC<SupikiModelProps> = ({ x, y, direction, isMoving, onClick }) => {
  const imageClassName = isMoving
    ? 'supiki-model__image supiki-model__image--walking'
    : 'supiki-model__image'

  return (
    <div
      className="supiki-model"
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
