import supikiPng from '@/assets/supiki.png'
import React, { useEffect, useRef } from 'react'
import styles from './index.module.css'

export const MouseSupiki: React.FC = () => {
  const supikiRef = useRef<HTMLDivElement>(null)
  const targetX = useRef(0)
  const targetY = useRef(0)
  const currentX = useRef(0)
  const currentY = useRef(0)
  const rafId = useRef<number | null>(null)

  const easing = 0.18
  const xOffset = 16
  const yOffset = 32

  useEffect(() => {
    const el = supikiRef.current
    if (!el) return

    const setVars = (x: number, y: number) => {
      el.style.setProperty('--x', `${x}px`)
      el.style.setProperty('--y', `${y}px`)
    }

    const resetPosition = () => {
      const w = el.offsetWidth || 0
      const h = el.offsetHeight || 0
      currentX.current = targetX.current = -w - 10
      currentY.current = targetY.current = -h - 10
      setVars(currentX.current, currentY.current)
    }

    const tick = () => {
      rafId.current = null
      currentX.current += (targetX.current - currentX.current) * easing
      currentY.current += (targetY.current - currentY.current) * easing
      setVars(currentX.current, currentY.current)

      if (
        Math.abs(targetX.current - currentX.current) +
          Math.abs(targetY.current - currentY.current) >
        0.5
      ) {
        rafId.current = requestAnimationFrame(tick)
      }
    }

    const onResize = () => resetPosition()
    const onMouseMove = (e: MouseEvent) => {
      targetX.current = e.clientX + xOffset
      targetY.current = window.innerHeight - e.clientY - yOffset
      if (rafId.current === null) rafId.current = requestAnimationFrame(tick)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    resetPosition()

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
        rafId.current = null
      }
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <div ref={supikiRef} className={styles['mouse-supiki']}>
      <img src={supikiPng} alt="Supiki" className={styles['mouse-supiki__image']} />
    </div>
  )
}
