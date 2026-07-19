import rareImage from '@/assets/C3supiki.png'
import normalImage from '@/assets/supiki.png'
import { motion } from 'motion/react'
import React from 'react'
import type { SupikiState } from '../SupikiProcess/types'
import styles from './index.module.css'

interface SupikiModelProps {
  supiki: SupikiState
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void
}

export const SupikiModel: React.FC<SupikiModelProps> = ({ supiki, onClick }) => {
  const { x, y, targetX, targetY, direction, isMoving, isRare } = supiki
  const imageSrc = isRare ? rareImage : normalImage
  const scaleX = direction === 'left' ? -1 : 1

  return (
    <motion.div
      className={styles['supiki-model']}
      initial={{ x: x, y: y }}
      animate={{ x: targetX, y: targetY }}
      transition={{ duration: 2, ease: 'linear' }}
      onClick={onClick}
    >
      <motion.img
        src={imageSrc}
        alt="Supiki"
        className={styles['supiki-model__image']}
        style={{ scaleX }}
        animate={isMoving ? { scaleY: [1, 0.85, 1, 0.85, 1] } : { scaleY: 1 }}
        transition={isMoving ? { duration: 1.5, ease: 'easeInOut', repeat: Infinity } : {}}
      />
    </motion.div>
  )
}
