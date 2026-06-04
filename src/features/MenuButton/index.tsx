import supiki from '@/assets/supiki.png'
import clearSupikis from '@/features/Supiki/SupikiProcess/clear'
import { MenuItem, MenuPopup } from '@/shared/ui'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './index.module.css'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'theme'

const getSystemTheme = (): Theme => {
  if (!window.matchMedia) return 'dark'

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
}

export const MenuButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    return stored ?? getSystemTheme()
  })
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

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const handleToggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)
    setTheme(nextTheme)
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }

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
        <MenuItem onClick={() => navigate('/grid')}>方眼ペイント</MenuItem>
        <MenuItem onClick={() => navigate('/image')}>画像変換</MenuItem>
        <MenuItem onClick={() => navigate('/markdown')}>Markdown</MenuItem>
        <MenuItem onClick={() => navigate('/supiki')}>スピキ牧場</MenuItem>
        <MenuItem onClick={handleToggleTheme}>{theme === 'dark' ? 'ダーク' : 'ライト'}</MenuItem>
        <MenuItem onClick={() => clearSupikis()}>ｽﾋﾟｷｦｲｼﾞﾒﾇﾝﾃﾞ</MenuItem>
      </MenuPopup>
    </div>
  )
}
