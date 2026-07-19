import clearSupikis from '@/features/Supiki/SupikiProcess/clear'
import { useTheme } from '@/shared/hooks/useTheme'
import { MenuItem, MenuPopup } from '@/shared/ui'
import { useNavigate } from 'react-router-dom'
import styles from './index.module.css'

export const Navigate = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className={styles.container}>
      <MenuPopup isOpen={true} onClose={() => {}} className={styles.menuPopupFixed}>
        <MenuItem onClick={() => navigate('/')}>トップ</MenuItem>
        <MenuItem onClick={() => navigate('/bus')}>バス時刻表</MenuItem>
        <MenuItem onClick={() => navigate('/grid')}>方眼ペイント</MenuItem>
        <MenuItem onClick={() => navigate('/image')}>画像変換</MenuItem>
        <MenuItem onClick={() => navigate('/supiki')}>スピキ牧場</MenuItem>
        <MenuItem onClick={toggleTheme}>テーマ:{theme === 'dark' ? 'ダーク' : 'ライト'}</MenuItem>
        <MenuItem onClick={() => clearSupikis()}>ｽﾋﾟｷｦｲｼﾞﾒﾇﾝﾃﾞ</MenuItem>
      </MenuPopup>
    </div>
  )
}
