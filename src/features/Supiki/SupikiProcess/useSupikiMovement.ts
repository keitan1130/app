import { useCallback, useEffect, useRef, useState } from 'react'
import { SUPIKI_CLEAR_EVENT } from './clear'
import { SUPIKI_SPAWN_EVENT } from './spawn'
import type { SupikiState } from './types'

const DIRECTION_CHANGE_INTERVAL_MIN = 2000
const DIRECTION_CHANGE_INTERVAL_MAX = 4000
const SIZE = 100

const getNextTargetTime = () =>
  Date.now() +
  DIRECTION_CHANGE_INTERVAL_MIN +
  Math.random() * (DIRECTION_CHANGE_INTERVAL_MAX - DIRECTION_CHANGE_INTERVAL_MIN)
const getRandomAnimationDelay = () => Math.random() * 1.5
const getRandomPosition = (max: number, size: number) => Math.random() * (max - size)
const isRareSpawn = () => Math.random() < 0

const getNewTarget = (
  currentX: number,
  currentY: number,
  windowWidth: number,
  windowHeight: number,
  size: number
) => {
  const minDistance = 100
  const maxDistance = 300
  const distance = minDistance + Math.random() * (maxDistance - minDistance)
  const angle = Math.random() * 2 * Math.PI
  let targetX = currentX + Math.cos(angle) * distance
  let targetY = currentY + Math.sin(angle) * distance
  targetX = Math.max(0, Math.min(windowWidth - size, targetX))
  targetY = Math.max(0, Math.min(windowHeight - size, targetY))
  return { targetX, targetY }
}

export const useSupikiMovement = (initialSupikis: SupikiState[]) => {
  const [supikis, setSupikis] = useState<SupikiState[]>(initialSupikis)

  const nextIdRef = useRef(
    initialSupikis.length > 0 ? Math.max(...initialSupikis.map((s) => s.id)) + 1 : 1
  )

  const updateTargetsIndividually = useCallback(() => {
    const now = Date.now()
    setSupikis((prev) =>
      prev.map((supiki) => {
        if (now < supiki.nextTargetTime) return supiki
        const { targetX, targetY } = getNewTarget(
          supiki.targetX,
          supiki.targetY,
          window.innerWidth,
          window.innerHeight,
          SIZE
        )
        const dx = targetX - supiki.targetX
        const direction = Math.abs(dx) > 30 ? (dx < 0 ? 'left' : 'right') : supiki.direction

        return {
          ...supiki,
          x: supiki.targetX,
          y: supiki.targetY,
          targetX,
          targetY,
          direction,
          nextTargetTime: getNextTargetTime(),
          isMoving: true,
        }
      })
    )
  }, [])

  useEffect(() => {
    const targetInterval = setInterval(updateTargetsIndividually, 100)
    return () => clearInterval(targetInterval)
  }, [updateTargetsIndividually])

  const addSupiki = useCallback((x: number, y: number) => {
    const newId = nextIdRef.current++
    const { targetX, targetY } = getNewTarget(x, y, window.innerWidth, window.innerHeight, SIZE)
    setSupikis((prev) => [
      ...prev,
      {
        id: newId,
        x,
        y,
        direction: 'right',
        targetX,
        targetY,
        animationDelay: getRandomAnimationDelay(),
        nextTargetTime: getNextTargetTime(),
        isMoving: true,
        isRare: isRareSpawn(),
      },
    ])
  }, [])

  const spawnRandomSupiki = useCallback(() => {
    const x = getRandomPosition(window.innerWidth, SIZE)
    const y = getRandomPosition(window.innerHeight, SIZE)
    addSupiki(x, y)
  }, [addSupiki])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const clearHandler = () => {
      setSupikis([])
      nextIdRef.current = 1
    }
    window.addEventListener(SUPIKI_CLEAR_EVENT, clearHandler)
    window.addEventListener(SUPIKI_SPAWN_EVENT, spawnRandomSupiki)
    return () => {
      window.removeEventListener(SUPIKI_CLEAR_EVENT, clearHandler)
      window.removeEventListener(SUPIKI_SPAWN_EVENT, spawnRandomSupiki)
    }
  }, [spawnRandomSupiki])

  return { supikis, addSupiki }
}

export const createInitialSupiki = (): SupikiState => {
  const x = typeof window !== 'undefined' ? getRandomPosition(window.innerWidth, SIZE) : 0
  const y = typeof window !== 'undefined' ? getRandomPosition(window.innerHeight, SIZE) : 0
  const { targetX, targetY } =
    typeof window !== 'undefined'
      ? getNewTarget(x, y, window.innerWidth, window.innerHeight, SIZE)
      : { targetX: x, targetY: y }
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
    isRare: isRareSpawn(),
  }
}
