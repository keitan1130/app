import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TopPage } from '@/pages/TopPage'
import { BusTimetablePage } from '@/pages/BusTimetablePage'
function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/bus" element={<BusTimetablePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
