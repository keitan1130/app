import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { Supiki } from '@/features/Supiki'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Supiki />
  </StrictMode>
)
