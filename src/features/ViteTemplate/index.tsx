import reactLogo from '@/assets/react.svg'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './index.module.css'
import viteLogo from '/vite.svg'

export const ViteTemplate = () => {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <div className={styles['logo-container']}>
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className={styles.logo} alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img
            src={reactLogo}
            className={`${styles.logo} ${styles['logo-react']}`}
            alt="React logo"
          />
        </a>
      </div>
      <h1 className={styles.title}>Vite + React</h1>
      <div className={styles.card}>
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <button onClick={() => navigate('/bus')}>バス時刻表</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className={styles['read-the-docs']}>Click on the Vite and React logos to learn more</p>
    </div>
  )
}
