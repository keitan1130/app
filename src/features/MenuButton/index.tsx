import supiki from '@/assets/supiki.png'
import clearSupikis from '@/features/Supiki/SupikiProcess/clear'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './index.module.css'
import { MenuItem, MenuPopup } from './MenuPopup'

export const MenuButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()

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

      <MenuPopup isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <MenuItem onClick={() => navigate('/')}>トップ</MenuItem>
        <MenuItem onClick={() => navigate('/bus')}>バス時刻表</MenuItem>
        <MenuItem onClick={() => navigate('/png')}>画像暗号化</MenuItem>
        <MenuItem onClick={() => navigate('/supiki')}>スピキ牧場</MenuItem>
        <MenuItem onClick={() => clearSupikis()}>ｽﾋﾟｷｦｲｼﾞﾒﾇﾝﾃﾞ</MenuItem>
      </MenuPopup>
    </div>
  )
}
