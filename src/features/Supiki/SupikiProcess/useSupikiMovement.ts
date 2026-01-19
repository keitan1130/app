import { useCallback, useEffect, useRef, useState } from 'react'
import type { SupikiState } from './types'

const SPEED = 1.5
const DIRECTION_CHANGE_INTERVAL_MIN = 2000 // 最小2秒
const DIRECTION_CHANGE_INTERVAL_MAX = 4000 // 最大4秒

// ランダムな次回ターゲット変更時刻を生成
const getNextTargetTime = () => {
  return (
    Date.now() +
    DIRECTION_CHANGE_INTERVAL_MIN +
    Math.random() * (DIRECTION_CHANGE_INTERVAL_MAX - DIRECTION_CHANGE_INTERVAL_MIN)
  )
}

// ランダムなアニメーション遅延を生成（0〜1.5秒）
const getRandomAnimationDelay = () => {
  return Math.random() * 1.5
}

const getRandomPosition = (max: number, size: number) => {
  return Math.random() * (max - size)
}

const getNewTarget = (
  currentX: number,
  currentY: number,
  windowWidth: number,
  windowHeight: number,
  size: number
) => {
  // 現在位置からランダムな距離を移動
  const maxDistance = 300
  const minDistance = 100

  const distance = minDistance + Math.random() * (maxDistance - minDistance)
  const angle = Math.random() * 2 * Math.PI

  let targetX = currentX + Math.cos(angle) * distance
  let targetY = currentY + Math.sin(angle) * distance

  // 画面内に収める
  targetX = Math.max(0, Math.min(windowWidth - size, targetX))
  targetY = Math.max(0, Math.min(windowHeight - size, targetY))

  return { targetX, targetY }
}

export const useSupikiMovement = (initialSupikis: SupikiState[]) => {
  const [supikis, setSupikis] = useState<SupikiState[]>(initialSupikis)
  const nextIdRef = useRef(initialSupikis.length + 1)

  // 個別のタイミングでターゲットを更新
  const updateTargetsIndividually = useCallback(() => {
    const now = Date.now()
    setSupikis((prev) =>
      prev.map((supiki) => {
        // まだ次の変更時刻になっていない場合はスキップ
        if (now < supiki.nextTargetTime) {
          return supiki
        }

        const size = 100
        const { targetX, targetY } = getNewTarget(
          supiki.x,
          supiki.y,
          window.innerWidth,
          window.innerHeight,
          size
        )
        return {
          ...supiki,
          targetX,
          targetY,
          nextTargetTime: getNextTargetTime(), // 次回の変更時刻を設定
        }
      })
    )
  }, [])

  // 移動処理
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setSupikis((prev) =>
        prev.map((supiki) => {
          const dx = supiki.targetX - supiki.x
          const dy = supiki.targetY - supiki.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < SPEED) {
            // 目標に到着したら停止
            return { ...supiki, isMoving: false }
          }

          const newX = supiki.x + (dx / distance) * SPEED
          const newY = supiki.y + (dy / distance) * SPEED

          // 移動方向に基づいて向きを決定（頻度を減らすため閾値を設ける）
          let newDirection = supiki.direction
          if (Math.abs(dx) > 30) {
            newDirection = dx < 0 ? 'left' : 'right'
          }

          return {
            ...supiki,
            x: newX,
            y: newY,
            direction: newDirection,
            isMoving: true,
          }
        })
      )
    }, 16)

    return () => clearInterval(moveInterval)
  }, [])

  // 高頻度でチェックし、個別のタイミングでターゲットを更新
  useEffect(() => {
    const targetInterval = setInterval(updateTargetsIndividually, 100) // 100msごとにチェック
    return () => clearInterval(targetInterval)
  }, [updateTargetsIndividually])

  // supikiを追加
  const addSupiki = useCallback((x: number, y: number) => {
    const newId = nextIdRef.current++
    const size = 100
    const { targetX, targetY } = getNewTarget(x, y, window.innerWidth, window.innerHeight, size)

    setSupikis((prev) => [
      ...prev,
      {
        id: newId,
        x,
        y,
        direction: 'right' as const,
        targetX,
        targetY,
        animationDelay: getRandomAnimationDelay(),
        nextTargetTime: getNextTargetTime(),
        isMoving: true,
      },
    ])
  }, [])

  return { supikis, addSupiki }
}

export const createInitialSupiki = (): SupikiState => {
  const size = 100
  const x = getRandomPosition(window.innerWidth, size)
  const y = getRandomPosition(window.innerHeight, size)
  const { targetX, targetY } = getNewTarget(x, y, window.innerWidth, window.innerHeight, size)

  return {
    id: 1,
    x,
    y,
    direction: 'right',
    targetX,
    targetY,
    animationDelay: getRandomAnimationDelay(),
    nextTargetTime: getNextTargetTime(),
    isMoving: true,
  }
}
