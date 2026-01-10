import { useRef, useEffect, useState, useCallback } from 'react'
import { BusCard } from './BusCard'
import styles from './index.module.css'

// バス時刻データ（秒単位）
// runsOnReduced: 減便運行時も走る場合は true、走らない場合は false
// 新飯塚駅 → 九州工業大学
const iizukaToKyutech = [
  { departure: 28740, arrival: 29580, runsOnReduced: true },  // 07:59 → 08:13
  { departure: 29580, arrival: 30420, runsOnReduced: false }, // 08:13 → 08:27
  { departure: 30720, arrival: 31560, runsOnReduced: true },  // 08:32 → 08:46
  { departure: 32100, arrival: 32940, runsOnReduced: false }, // 08:55 → 09:09
  { departure: 33000, arrival: 33840, runsOnReduced: true },  // 09:10 → 09:24
  { departure: 34200, arrival: 35040, runsOnReduced: false }, // 09:30 → 09:44
  { departure: 36000, arrival: 36840, runsOnReduced: true },  // 10:00 → 10:14
  { departure: 36300, arrival: 37140, runsOnReduced: false }, // 10:05 → 10:19
  { departure: 38460, arrival: 39300, runsOnReduced: true },  // 10:41 → 10:55
  { departure: 39240, arrival: 40080, runsOnReduced: false }, // 10:54 → 11:08
  { departure: 40680, arrival: 41520, runsOnReduced: true },  // 11:18 → 11:32
  { departure: 42900, arrival: 43740, runsOnReduced: false }, // 11:55 → 12:09
  { departure: 45420, arrival: 46260, runsOnReduced: true },  // 12:37 → 12:51
  { departure: 47100, arrival: 47940, runsOnReduced: false }, // 13:05 → 13:19
  { departure: 48900, arrival: 49740, runsOnReduced: true },  // 13:35 → 13:49
  { departure: 51420, arrival: 52260, runsOnReduced: false }, // 14:17 → 14:31
  { departure: 53640, arrival: 54480, runsOnReduced: true },  // 14:54 → 15:08
  { departure: 54540, arrival: 55380, runsOnReduced: false }, // 15:09 → 15:23
  { departure: 57240, arrival: 58080, runsOnReduced: true },  // 15:54 → 16:08
  { departure: 59640, arrival: 60480, runsOnReduced: false }, // 16:34 → 16:48
  { departure: 60360, arrival: 61560, runsOnReduced: true },  // 16:46 → 17:06
  { departure: 62760, arrival: 63960, runsOnReduced: false }, // 17:26 → 17:46
  { departure: 63660, arrival: 64860, runsOnReduced: true },  // 17:41 → 18:01
  { departure: 65460, arrival: 66660, runsOnReduced: false }, // 18:11 → 18:31
  { departure: 66660, arrival: 67860, runsOnReduced: true },  // 18:31 → 18:51
  { departure: 67860, arrival: 69060, runsOnReduced: false }, // 18:51 → 19:11
  { departure: 69060, arrival: 70260, runsOnReduced: true },  // 19:11 → 19:31
  { departure: 70440, arrival: 71280, runsOnReduced: false }, // 19:34 → 19:48
  { departure: 71640, arrival: 72480, runsOnReduced: true },  // 19:54 → 20:08
  { departure: 73500, arrival: 74340, runsOnReduced: true }, // 20:25 → 20:39
]

// 九州工業大学 → 新飯塚駅
const kyutechToIizuka = [
  { departure: 29880, arrival: 30720, runsOnReduced: true },  // 08:18 → 08:32
  { departure: 31260, arrival: 32100, runsOnReduced: false }, // 08:41 → 08:55
  { departure: 32160, arrival: 33000, runsOnReduced: true },  // 08:56 → 09:10
  { departure: 33360, arrival: 34200, runsOnReduced: false }, // 09:16 → 09:30
  { departure: 35160, arrival: 36000, runsOnReduced: true },  // 09:46 → 10:00
  { departure: 35460, arrival: 36300, runsOnReduced: false }, // 09:51 → 10:05
  { departure: 37620, arrival: 38460, runsOnReduced: true },  // 10:27 → 10:41
  { departure: 38400, arrival: 39240, runsOnReduced: false }, // 10:40 → 10:54
  { departure: 39840, arrival: 40680, runsOnReduced: true },  // 11:04 → 11:18
  { departure: 42060, arrival: 42900, runsOnReduced: false }, // 11:41 → 11:55
  { departure: 44580, arrival: 45420, runsOnReduced: true },  // 12:23 → 12:37
  { departure: 46200, arrival: 47100, runsOnReduced: false }, // 12:50 → 13:05
  { departure: 48060, arrival: 48900, runsOnReduced: true },  // 13:21 → 13:35
  { departure: 50580, arrival: 51420, runsOnReduced: false }, // 14:03 → 14:17
  { departure: 52800, arrival: 53640, runsOnReduced: true },  // 14:40 → 14:54
  { departure: 53700, arrival: 54540, runsOnReduced: false }, // 14:55 → 15:09
  { departure: 56400, arrival: 57240, runsOnReduced: true },  // 15:40 → 15:54
  { departure: 58800, arrival: 59640, runsOnReduced: false }, // 16:20 → 16:34
  { departure: 59400, arrival: 60360, runsOnReduced: true },  // 16:30 → 16:46
  { departure: 61800, arrival: 62760, runsOnReduced: false }, // 17:10 → 17:26
  { departure: 62700, arrival: 63660, runsOnReduced: true },  // 17:25 → 17:41
  { departure: 64500, arrival: 65460, runsOnReduced: false }, // 17:55 → 18:11
  { departure: 65700, arrival: 66660, runsOnReduced: true },  // 18:15 → 18:31
  { departure: 66900, arrival: 67860, runsOnReduced: false }, // 18:35 → 18:51
  { departure: 68100, arrival: 69060, runsOnReduced: true },  // 18:55 → 19:11
  { departure: 69600, arrival: 70440, runsOnReduced: false }, // 19:20 → 19:34
  { departure: 70800, arrival: 71640, runsOnReduced: true },  // 19:40 → 19:54
  { departure: 72660, arrival: 73500, runsOnReduced: true }, // 20:11 → 20:25
  { departure: 74700, arrival: 75540, runsOnReduced: false },  // 20:45 → 20:59
]

// 現在時刻を秒単位で取得
const getCurrentTimeInSeconds = (): number => {
  const now = new Date()
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
}

// バスデータの型
type BusSchedule = { departure: number; arrival: number; runsOnReduced: boolean }

// 次のバスのインデックスを取得
const getNextBusIndex = (
  schedule: BusSchedule[],
  currentSeconds: number,
  isReducedService: boolean
): number => {
  const index = schedule.findIndex(
    (bus) => bus.departure > currentSeconds && (!isReducedService || bus.runsOnReduced)
  )
  return index === -1 ? schedule.length - 1 : index
}

export const BusTimetable = () => {
  const [currentTime, setCurrentTime] = useState(getCurrentTimeInSeconds())
  const [isReducedService, setIsReducedService] = useState(false)
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

  // 減便時にフィルタリングしたスケジュール
  const filteredIizuka = isReducedService
    ? iizukaToKyutech.filter((bus) => bus.runsOnReduced)
    : iizukaToKyutech
  const filteredKyutech = isReducedService
    ? kyutechToIizuka.filter((bus) => bus.runsOnReduced)
    : kyutechToIizuka

  const nextIizukaIndex = getNextBusIndex(iizukaToKyutech, currentTime, isReducedService)
  const nextKyutechIndex = getNextBusIndex(kyutechToIizuka, currentTime, isReducedService)

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
      <div className={styles.toggleContainer}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={isReducedService}
            onChange={(e) => setIsReducedService(e.target.checked)}
            className={styles.toggleInput}
          />
          <span className={styles.toggleSwitch}></span>
          <span className={styles.toggleText}>
            {isReducedService ? '🚧 減便運行中' : '🚌 通常運行'}
          </span>
        </label>
      </div>

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
            {filteredIizuka.map((bus) => {
              const originalIndex = iizukaToKyutech.indexOf(bus)
              return (
                <div
                  key={originalIndex}
                  ref={(el) => {
                    iizukaCardRefs.current[originalIndex] = el
                  }}
                >
                  <BusCard
                    departureTime={bus.departure}
                    arrivalTime={bus.arrival}
                    isPast={bus.departure <= currentTime}
                    isNext={originalIndex === nextIizukaIndex}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* 九州工業大学 → 新飯塚駅 */}
        <div className={styles.column}>
          <h2 className={styles.columnTitle}>
            <span className={styles.stationIcon}>🏫</span>
            九州工業大学 → 新飯塚駅
          </h2>
          <div className={styles.cardList} ref={kyutechListRef}>
            {filteredKyutech.map((bus) => {
              const originalIndex = kyutechToIizuka.indexOf(bus)
              return (
                <div
                  key={originalIndex}
                  ref={(el) => {
                    kyutechCardRefs.current[originalIndex] = el
                  }}
                >
                  <BusCard
                    departureTime={bus.departure}
                    arrivalTime={bus.arrival}
                    isPast={bus.departure <= currentTime}
                    isNext={originalIndex === nextKyutechIndex}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusTimetable
