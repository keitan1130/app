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
// 過ぎた場合は負の時間を返す（-5分以上過ぎた場合はnull）
const getTimeUntilDeparture = (
  departureSeconds: number
): { time: string; isOverdue: boolean } | null => {
  const now = new Date()
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  const diff = departureSeconds - currentSeconds

  // -5分（-300秒）以上過ぎた場合はnullを返す
  if (diff < -300) return null

  const isOverdue = diff < 0
  const absDiff = Math.abs(diff)

  const hours = Math.floor(absDiff / 3600)
  const minutes = Math.floor((absDiff % 3600) / 60)
  const seconds = absDiff % 60

  const timeString = `${isOverdue ? '-' : ''}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return { time: timeString, isOverdue }
}

export const BusCard = ({ departureTime, arrivalTime, isPast, isNext }: BusCardProps) => {
  const timeUntilData = getTimeUntilDeparture(departureTime)

  return (
    <div className={`${styles.card} ${isPast ? styles.past : ''} ${isNext ? styles.next : ''}`}>
      <div className={styles.timeInfo}>
        <span className={styles.departure}>{formatTime(departureTime)}発</span>
        <span className={styles.arrow}>→</span>
        <span className={styles.arrival}>{formatTime(arrivalTime)}着</span>
        {timeUntilData && (
          <span className={`${styles.until} ${timeUntilData.isOverdue ? styles.overdue : ''}`}>
            {timeUntilData.time}
          </span>
        )}
      </div>
    </div>
  )
}

export default BusCard
