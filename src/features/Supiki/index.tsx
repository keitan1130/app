import React, { useState } from 'react'
import { SupikiModel } from './SupikiModel'
import { useSupikiMovement } from './SupikiProcess/useSupikiMovement'
import { useSupikiVoice } from './SupikiProcess/useSupikiVoice'
import type { SupikiState } from './SupikiProcess/types'
import './index.module.css'

// 初期Supikiを作成するヘルパー関数
const createInitialSupiki = (): SupikiState => {
  const size = 100
  const x = typeof window !== 'undefined' ? Math.random() * (window.innerWidth - size) : 0
  const y = typeof window !== 'undefined' ? Math.random() * (window.innerHeight - size) : 0

  return {
    id: 1,
    x,
    y,
    direction: 'right',
    targetX: x,
    targetY: y,
    animationDelay: Math.random() * 1.5,
    nextTargetTime: Date.now() + 2000 + Math.random() * 2000,
    isMoving: false,
  }
}

export const Supiki: React.FC = () => {
  // クライアントサイドでのみ初期化（遅延初期化を使用）
  const [initialSupikis] = useState<SupikiState[]>(() => {
    if (typeof window === 'undefined') {
      return []
    }
    return [createInitialSupiki()]
  })

  // サーバーサイドレンダリング時は何も表示しない
  if (typeof window === 'undefined' || initialSupikis.length === 0) {
    return null
  }

  return <SupikiContent initialSupikis={initialSupikis} />
}

interface SupikiContentProps {
  initialSupikis: SupikiState[]
}

const SupikiContent: React.FC<SupikiContentProps> = ({ initialSupikis }) => {
  const { supikis, addSupiki } = useSupikiMovement(initialSupikis)
  const { playVoice } = useSupikiVoice()

  const handleSupikiClick = (supiki: SupikiState) => {
    // ボイスを順番に再生（falseで順番、trueでランダム）
    playVoice(true)

    // 同じ場所から新しいsupikiを追加
    addSupiki(supiki.x, supiki.y)
  }

  return (
    <>
      {supikis.map((supiki) => (
        <SupikiModel
          key={supiki.id}
          x={supiki.x}
          y={supiki.y}
          direction={supiki.direction}
          isMoving={supiki.isMoving}
          onClick={() => handleSupikiClick(supiki)}
        />
      ))}
    </>
  )
}
