import { MenuButton } from '@/features/MenuButton'
import { BusTimetablePage } from '@/pages/BusTimetablePage'
import { EncryptionPngPage } from '@/pages/EncryptionPngPage'
import { SupikiRanchPage } from '@/pages/SupikiRanchPage'
import { TopPage } from '@/pages/TopPage'
import { HashRouter, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/bus" element={<BusTimetablePage />} />
        <Route path="/png" element={<EncryptionPngPage />} />
        <Route path="/supiki" element={<SupikiRanchPage />} />
      </Routes>
      <MenuButton />
    </HashRouter>
  )
}

export default App
