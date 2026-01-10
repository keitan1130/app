import styles from './index.module.css'

type BusCardProps = {
  departureTime: number // 秒単位
  arrivalTime: number // 秒単位
  isPast: boolean
  isNext: boolean
}

// 秒を時:分形式に変換
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// 出発までの残り時間を計算（HH:MM:SS形式）
const getTimeUntilDeparture = (departureSeconds: number): string | null => {
  const now = new Date()
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  const diff = departureSeconds - currentSeconds

  if (diff <= 0) return null

  const hours = Math.floor(diff / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const BusCard = ({ departureTime, arrivalTime, isPast, isNext }: BusCardProps) => {
  const timeUntil = getTimeUntilDeparture(departureTime)

  return (
    <div className={`${styles.card} ${isPast ? styles.past : ''} ${isNext ? styles.next : ''}`}>
      <div className={styles.timeInfo}>
        <span className={styles.departure}>{formatTime(departureTime)}発</span>
        <span className={styles.arrow}>→</span>
        <span className={styles.arrival}>{formatTime(arrivalTime)}着</span>
        {!isPast && timeUntil && <span className={styles.until}>{timeUntil}</span>}
      </div>
    </div>
  )
}

export default BusCard
