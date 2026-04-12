import { MenuButton } from '@/features/MenuButton'
import { BusTimetablePage } from '@/pages/BusTimetablePage'
import { ImageTransformPage } from '@/pages/ImageTransformPage'
import { MarkItDownPage } from '@/pages/MarkItDownPage'
import { PixelGridPage } from '@/pages/PixelGridPage'
import { SupikiRanchPage } from '@/pages/SupikiRanchPage'
import { TopPage } from '@/pages/TopPage'
import { HashRouter, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/bus" element={<BusTimetablePage />} />
        <Route path="/grid" element={<PixelGridPage />} />
        <Route path="/supiki" element={<SupikiRanchPage />} />
        <Route path="/image" element={<ImageTransformPage />} />
        <Route path="/markitdown" element={<MarkItDownPage />} />
      </Routes>
      <MenuButton />
    </HashRouter>
  )
}

export default App
