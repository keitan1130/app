import { MenuButton } from '@/features/MenuButton'
import { BusTimetablePage } from '@/pages/BusTimetablePage'
import { EncryptionPngPage } from '@/pages/EncryptionPngPage'
import { TopPage } from '@/pages/TopPage'
import { HashRouter, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/bus" element={<BusTimetablePage />} />
        <Route path="/png" element={<EncryptionPngPage />} />
      </Routes>
      <MenuButton />
    </HashRouter>
  )
}

export default App
