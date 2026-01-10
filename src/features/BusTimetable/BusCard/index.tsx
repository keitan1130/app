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

// 所要時間を計算して表示
const formatDuration = (departureSeconds: number, arrivalSeconds: number): string => {
  const durationSeconds = arrivalSeconds - departureSeconds
  const hours = Math.floor(durationSeconds / 3600)
  const minutes = Math.floor((durationSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}時間${minutes}分`
  }
  return `${minutes}分`
}

// 出発までの残り時間を計算
const getMinutesUntilDeparture = (departureSeconds: number): number => {
  const now = new Date()
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  const diff = departureSeconds - currentSeconds
  return Math.ceil(diff / 60)
}

export const BusCard = ({ departureTime, arrivalTime, isPast, isNext }: BusCardProps) => {
  const minutesUntil = getMinutesUntilDeparture(departureTime)

  return (
    <div className={`${styles.card} ${isPast ? styles.past : ''} ${isNext ? styles.next : ''}`}>
      <div className={styles.timeInfo}>
        <span className={styles.departure}>{formatTime(departureTime)}発</span>
        <span className={styles.arrow}>→</span>
        <span className={styles.arrival}>{formatTime(arrivalTime)}着</span>
      </div>
      <div className={styles.details}>
        <span className={styles.duration}>
          所要時間: {formatDuration(departureTime, arrivalTime)}
        </span>
        {!isPast && (
          <span className={styles.until}>
            {minutesUntil > 0 ? `${minutesUntil}分後に出発` : 'まもなく出発'}
          </span>
        )}
      </div>
    </div>
  )
}

export default BusCard
