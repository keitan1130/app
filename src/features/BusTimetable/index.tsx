import { useRef, useEffect, useState, useCallback } from 'react'
import { BusCard } from './BusCard'
import styles from './index.module.css'

// バス時刻データ（秒単位）
// 新飯塚駅 → 九州工業大学
const iizukaToKyutech = [
  { departure: 28740, arrival: 29580 }, // 07:59 → 08:13
  { departure: 29580, arrival: 30420 }, // 08:13 → 08:27
  { departure: 30720, arrival: 31560 }, // 08:32 → 08:46
  { departure: 32100, arrival: 32940 }, // 08:55 → 09:09
  { departure: 33000, arrival: 33840 }, // 09:10 → 09:24
  { departure: 34200, arrival: 35040 }, // 09:30 → 09:44
  { departure: 36000, arrival: 36840 }, // 10:00 → 10:14
  { departure: 36300, arrival: 37140 }, // 10:05 → 10:19
  { departure: 38460, arrival: 39300 }, // 10:41 → 10:55
  { departure: 39240, arrival: 40080 }, // 10:54 → 11:08
  { departure: 40680, arrival: 41520 }, // 11:18 → 11:32
  { departure: 42900, arrival: 43740 }, // 11:55 → 12:09
  { departure: 45420, arrival: 46260 }, // 12:37 → 12:51
  { departure: 47100, arrival: 47940 }, // 13:05 → 13:19
  { departure: 48900, arrival: 49740 }, // 13:35 → 13:49
  { departure: 51420, arrival: 52260 }, // 14:17 → 14:31
  { departure: 53640, arrival: 54480 }, // 14:54 → 15:08
  { departure: 54540, arrival: 55380 }, // 15:09 → 15:23
  { departure: 57240, arrival: 58080 }, // 15:54 → 16:08
  { departure: 59640, arrival: 60480 }, // 16:34 → 16:48
  { departure: 60360, arrival: 61560 }, // 16:46 → 17:06
  { departure: 62760, arrival: 63960 }, // 17:26 → 17:46
  { departure: 63660, arrival: 64860 }, // 17:41 → 18:01
  { departure: 65460, arrival: 66660 }, // 18:11 → 18:31
  { departure: 66660, arrival: 67860 }, // 18:31 → 18:51
  { departure: 67860, arrival: 69060 }, // 18:51 → 19:11
  { departure: 69060, arrival: 70260 }, // 19:11 → 19:31
  { departure: 70440, arrival: 71280 }, // 19:34 → 19:48
  { departure: 71640, arrival: 72480 }, // 19:54 → 20:08
  { departure: 73500, arrival: 74340 }, // 20:25 → 20:39
]

// 九州工業大学 → 新飯塚駅
const kyutechToIizuka = [
  { departure: 29880, arrival: 30720 }, // 08:18 → 08:32
  { departure: 31260, arrival: 32100 }, // 08:41 → 08:55
  { departure: 32160, arrival: 33000 }, // 08:56 → 09:10
  { departure: 33360, arrival: 34200 }, // 09:16 → 09:30
  { departure: 35160, arrival: 36000 }, // 09:46 → 10:00
  { departure: 35460, arrival: 36300 }, // 09:51 → 10:05
  { departure: 37620, arrival: 38460 }, // 10:27 → 10:41
  { departure: 38400, arrival: 39240 }, // 10:40 → 10:54
  { departure: 39840, arrival: 40680 }, // 11:04 → 11:18
  { departure: 42060, arrival: 42900 }, // 11:41 → 11:55
  { departure: 44580, arrival: 45420 }, // 12:23 → 12:37
  { departure: 46200, arrival: 47100 }, // 12:50 → 13:05
  { departure: 48060, arrival: 48900 }, // 13:21 → 13:35
  { departure: 50580, arrival: 51420 }, // 14:03 → 14:17
  { departure: 52800, arrival: 53640 }, // 14:40 → 14:54
  { departure: 53700, arrival: 54540 }, // 14:55 → 15:09
  { departure: 56400, arrival: 57240 }, // 15:40 → 15:54
  { departure: 58800, arrival: 59640 }, // 16:20 → 16:34
  { departure: 59400, arrival: 60360 }, // 16:30 → 16:46
  { departure: 61800, arrival: 62760 }, // 17:10 → 17:26
  { departure: 62700, arrival: 63660 }, // 17:25 → 17:41
  { departure: 64500, arrival: 65460 }, // 17:55 → 18:11
  { departure: 65700, arrival: 66660 }, // 18:15 → 18:31
  { departure: 66900, arrival: 67860 }, // 18:35 → 18:51
  { departure: 68100, arrival: 69060 }, // 18:55 → 19:11
  { departure: 69600, arrival: 70440 }, // 19:20 → 19:34
  { departure: 70800, arrival: 71640 }, // 19:40 → 19:54
  { departure: 72660, arrival: 73500 }, // 20:11 → 20:25
  { departure: 74700, arrival: 75540 }, // 20:45 → 20:59
]

// 現在時刻を秒単位で取得
const getCurrentTimeInSeconds = (): number => {
  const now = new Date()
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
}

// 次のバスのインデックスを取得
const getNextBusIndex = (
  schedule: { departure: number; arrival: number }[],
  currentSeconds: number
): number => {
  const index = schedule.findIndex((bus) => bus.departure > currentSeconds)
  return index === -1 ? schedule.length - 1 : index
}

export const BusTimetable = () => {
  const [currentTime, setCurrentTime] = useState(getCurrentTimeInSeconds())
  const iizukaListRef = useRef<HTMLDivElement>(null)
  const kyutechListRef = useRef<HTMLDivElement>(null)
  const iizukaCardRefs = useRef<(HTMLDivElement | null)[]>([])
  const kyutechCardRefs = useRef<(HTMLDivElement | null)[]>([])

  // 1分ごとに現在時刻を更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeInSeconds())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const nextIizukaIndex = getNextBusIndex(iizukaToKyutech, currentTime)
  const nextKyutechIndex = getNextBusIndex(kyutechToIizuka, currentTime)

  // スクロール関数
  const scrollToNextBus = useCallback(
    (direction: 'iizuka' | 'kyutech') => {
      const index = direction === 'iizuka' ? nextIizukaIndex : nextKyutechIndex
      const refs = direction === 'iizuka' ? iizukaCardRefs : kyutechCardRefs
      const element = refs.current[index]
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    },
    [nextIizukaIndex, nextKyutechIndex]
  )

  // 初回マウント時に次のバスにスクロール
  useEffect(() => {
    scrollToNextBus('iizuka')
    scrollToNextBus('kyutech')
  }, [scrollToNextBus])

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <button className={styles.scrollButton} onClick={() => scrollToNextBus('iizuka')}>
          🚌 新飯塚駅発の次のバスへ
        </button>
        <button className={styles.scrollButton} onClick={() => scrollToNextBus('kyutech')}>
          🏫 九工大発の次のバスへ
        </button>
      </div>

      <div className={styles.timetableWrapper}>
        {/* 新飯塚駅 → 九州工業大学 */}
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>
            <span className={styles.stationIcon}>🚉</span>
            新飯塚駅 → 九州工業大学
          </h2>
          <div className={styles.cardList} ref={iizukaListRef}>
            {iizukaToKyutech.map((bus, index) => (
              <div
                key={index}
                ref={(el) => {
                  iizukaCardRefs.current[index] = el
                }}
              >
                <BusCard
                  departureTime={bus.departure}
                  arrivalTime={bus.arrival}
                  isPast={bus.departure <= currentTime}
                  isNext={index === nextIizukaIndex}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 九州工業大学 → 新飯塚駅 */}
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>
            <span className={styles.stationIcon}>🏫</span>
            九州工業大学 → 新飯塚駅
          </h2>
          <div className={styles.cardList} ref={kyutechListRef}>
            {kyutechToIizuka.map((bus, index) => (
              <div
                key={index}
                ref={(el) => {
                  kyutechCardRefs.current[index] = el
                }}
              >
                <BusCard
                  departureTime={bus.departure}
                  arrivalTime={bus.arrival}
                  isPast={bus.departure <= currentTime}
                  isNext={index === nextKyutechIndex}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusTimetable
