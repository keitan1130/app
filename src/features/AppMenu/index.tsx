import type React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clearSupikis from '@/features/Supiki/SupikiProcess/clear'
import spawnSupiki from '@/features/Supiki/SupikiProcess/spawn'
import { useTheme } from '@/shared/hooks/useTheme'
import { MenuItem, MenuPopup } from '@/shared/ui'

type AppMenuProps = {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export const AppMenu: React.FC<AppMenuProps> = ({ isOpen, onClose, className }) => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const [hasSupiki, setHasSupiki] = useState(() => {
    if (typeof document === 'undefined') return true
    return document.querySelectorAll('[class*="supiki-model"]').length > 0
  })

  useEffect(() => {
    const handleCount = (e: Event) => {
      const customEvent = e as CustomEvent<number>
      setHasSupiki(customEvent.detail > 0)
    }

    window.addEventListener('supiki:count', handleCount)
    return () => window.removeEventListener('supiki:count', handleCount)
  }, [])

  const menuItems = [
    { id: 'top', label: 'トップ', action: () => navigate('/') },
    { id: 'bus', label: 'バス時刻表', action: () => navigate('/bus') },
    { id: 'grid', label: '方眼ペイント', action: () => navigate('/grid') },
    { id: 'image', label: '画像変換', action: () => navigate('/image') },
    { id: 'supiki', label: 'スピキ牧場', action: () => navigate('/supiki') },
    { id: 'theme', label: `テーマ:${theme === 'dark' ? 'ダーク' : 'ライト'}`, action: toggleTheme },
    {
      id: 'toggle-supiki',
      label: hasSupiki ? 'ｽﾋﾟｷｦｲｼﾞﾒﾇﾝﾃﾞ' : 'ﾁｮﾜﾖｰ',
      action: hasSupiki ? clearSupikis : spawnSupiki,
    },
  ]

  return (
    <MenuPopup isOpen={isOpen} onClose={onClose} className={className}>
      {menuItems.map((item) => (
        <MenuItem
          key={item.id}
          onClick={() => {
            item.action()
            onClose()
          }}
        >
          {item.label}
        </MenuItem>
      ))}
    </MenuPopup>
  )
}
