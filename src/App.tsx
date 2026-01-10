import { HashRouter, Routes, Route } from 'react-router-dom'
import { TopPage } from '@/pages/TopPage'
import { BusTimetablePage } from '@/pages/BusTimetablePage'
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/bus" element={<BusTimetablePage />} />
      </Routes>
    </HashRouter>
  )
}

export default App
