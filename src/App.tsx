import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TopPage } from '@/pages/TopPage'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<TopPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
