import clearSupikis from '@/features/Supiki/SupikiProcess/clear'
import spawnSupiki from '@/features/Supiki/SupikiProcess/spawn'
import { useTheme } from '@/shared/hooks/useTheme'
import { MenuItem, MenuPopup } from '@/shared/ui'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
    { label: 'トップ', action: () => navigate('/') },
    { label: 'バス時刻表', action: () => navigate('/bus') },
    { label: '方眼ペイント', action: () => navigate('/grid') },
    { label: '画像変換', action: () => navigate('/image') },
    { label: 'スピキ牧場', action: () => navigate('/supiki') },
    { label: `テーマ:${theme === 'dark' ? 'ダーク' : 'ライト'}`, action: toggleTheme },
    {
      label: hasSupiki ? 'ｽﾋﾟｷｦｲｼﾞﾒﾇﾝﾃﾞ' : 'ﾁｮﾜﾖｰ',
      action: hasSupiki ? clearSupikis : spawnSupiki,
    },
  ]

  return (
    <MenuPopup isOpen={isOpen} onClose={onClose} className={className}>
      {menuItems.map((item, index) => (
        <MenuItem
          key={index}
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
