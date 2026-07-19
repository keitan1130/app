import supiki from '@/assets/supiki.png'
import { AppMenu } from '@/features/AppMenu'
import React, { useEffect, useRef, useState } from 'react'
import styles from './index.module.css'

export const MenuButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className={styles.menuContainer} ref={containerRef}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="menu-popup"
        className={styles.menuButton}
        onClick={() => setIsOpen((s) => !s)}
      >
        <img src={supiki} alt="supiki menu" className={styles.image} />
      </button>
      <AppMenu isOpen={isOpen} onClose={() => setIsOpen(false)} className={styles.menuPopupFixed} />
    </div>
  )
}
