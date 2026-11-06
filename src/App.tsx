import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes, useMatch } from 'react-router-dom'
import { MenuButton } from '@/features/MenuButton'
import { MouseSupiki } from '@/features/MouseSupiki'
import { Supiki } from '@/features/Supiki'
import { BusTimetablePage } from '@/pages/BusTimetablePage'
import { ImageTransformPage } from '@/pages/ImageTransformPage'
import { PixelGridPage } from '@/pages/PixelGridPage'
import { SupikiRanchPage } from '@/pages/SupikiRanchPage'
import { TopPage } from '@/pages/TopPage'

const SupikiPlaygroundPage = lazy(() => import('@/pages/SupikiPlaygroundPage'))

function AppContent() {
  const isPlayground = useMatch('/playground') !== null
  return (
    <>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/bus" element={<BusTimetablePage />} />
        <Route path="/grid" element={<PixelGridPage />} />
        <Route path="/supiki" element={<SupikiRanchPage />} />
        <Route path="/image" element={<ImageTransformPage />} />
        <Route
          path="/playground"
          element={
            <Suspense
              fallback={
                <div
                  role="status"
                  style={{
                    minHeight: '100svh',
                    display: 'grid',
                    placeItems: 'center',
                    background: '#f3eada',
                    color: '#655b4c',
                  }}
                >
                  あそびば、ひろげてます。
                </div>
              }
            >
              <SupikiPlaygroundPage />
            </Suspense>
          }
        />
      </Routes>
      {!isPlayground && (
        <>
          <MenuButton />
          <Supiki />
          <MouseSupiki />
        </>
      )}
    </>
  )
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  )
}

export default App
