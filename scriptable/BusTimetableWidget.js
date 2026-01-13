// Scriptable Bus Timetable Widget
// 新飯塚駅 ↔ 九州工業大学 バス時刻表ウィジェット

// ===== 設定 =====
const IS_REDUCED_SERVICE = false // 減便運行時は true に変更

// ===== バス時刻データ（秒単位） =====
// 新飯塚駅 → 九州工業大学
const iizukaToKyutech = [
  { departure: 28740, arrival: 29580, runsOnReduced: true }, // 07:59 → 08:13
  { departure: 29580, arrival: 30420, runsOnReduced: false }, // 08:13 → 08:27
  { departure: 30720, arrival: 31560, runsOnReduced: true }, // 08:32 → 08:46
  { departure: 32100, arrival: 32940, runsOnReduced: false }, // 08:55 → 09:09
  { departure: 33000, arrival: 33840, runsOnReduced: true }, // 09:10 → 09:24
  { departure: 34200, arrival: 35040, runsOnReduced: false }, // 09:30 → 09:44
  { departure: 36000, arrival: 36840, runsOnReduced: true }, // 10:00 → 10:14
  { departure: 36300, arrival: 37140, runsOnReduced: false }, // 10:05 → 10:19
  { departure: 38460, arrival: 39300, runsOnReduced: true }, // 10:41 → 10:55
  { departure: 39240, arrival: 40080, runsOnReduced: false }, // 10:54 → 11:08
  { departure: 40680, arrival: 41520, runsOnReduced: true }, // 11:18 → 11:32
  { departure: 42900, arrival: 43740, runsOnReduced: false }, // 11:55 → 12:09
  { departure: 45420, arrival: 46260, runsOnReduced: true }, // 12:37 → 12:51
  { departure: 47100, arrival: 47940, runsOnReduced: false }, // 13:05 → 13:19
  { departure: 48900, arrival: 49740, runsOnReduced: true }, // 13:35 → 13:49
  { departure: 51420, arrival: 52260, runsOnReduced: false }, // 14:17 → 14:31
  { departure: 53640, arrival: 54480, runsOnReduced: true }, // 14:54 → 15:08
  { departure: 54540, arrival: 55380, runsOnReduced: false }, // 15:09 → 15:23
  { departure: 57240, arrival: 58080, runsOnReduced: true }, // 15:54 → 16:08
  { departure: 59640, arrival: 60480, runsOnReduced: false }, // 16:34 → 16:48
  { departure: 60360, arrival: 61560, runsOnReduced: true }, // 16:46 → 17:06
  { departure: 62760, arrival: 63960, runsOnReduced: false }, // 17:26 → 17:46
  { departure: 63660, arrival: 64860, runsOnReduced: true }, // 17:41 → 18:01
  { departure: 65460, arrival: 66660, runsOnReduced: false }, // 18:11 → 18:31
  { departure: 66660, arrival: 67860, runsOnReduced: true }, // 18:31 → 18:51
  { departure: 67860, arrival: 69060, runsOnReduced: false }, // 18:51 → 19:11
  { departure: 69060, arrival: 70260, runsOnReduced: true }, // 19:11 → 19:31
  { departure: 70440, arrival: 71280, runsOnReduced: false }, // 19:34 → 19:48
  { departure: 71640, arrival: 72480, runsOnReduced: true }, // 19:54 → 20:08
  { departure: 73500, arrival: 74340, runsOnReduced: true }, // 20:25 → 20:39
]

// 九州工業大学 → 新飯塚駅
const kyutechToIizuka = [
  { departure: 29880, arrival: 30720, runsOnReduced: true }, // 08:18 → 08:32
  { departure: 31260, arrival: 32100, runsOnReduced: false }, // 08:41 → 08:55
  { departure: 32160, arrival: 33000, runsOnReduced: true }, // 08:56 → 09:10
  { departure: 33360, arrival: 34200, runsOnReduced: false }, // 09:16 → 09:30
  { departure: 35160, arrival: 36000, runsOnReduced: true }, // 09:46 → 10:00
  { departure: 35460, arrival: 36300, runsOnReduced: false }, // 09:51 → 10:05
  { departure: 37620, arrival: 38460, runsOnReduced: true }, // 10:27 → 10:41
  { departure: 38400, arrival: 39240, runsOnReduced: false }, // 10:40 → 10:54
  { departure: 39840, arrival: 40680, runsOnReduced: true }, // 11:04 → 11:18
  { departure: 42060, arrival: 42900, runsOnReduced: false }, // 11:41 → 11:55
  { departure: 44580, arrival: 45420, runsOnReduced: true }, // 12:23 → 12:37
  { departure: 46200, arrival: 47100, runsOnReduced: false }, // 12:50 → 13:05
  { departure: 48060, arrival: 48900, runsOnReduced: true }, // 13:21 → 13:35
  { departure: 50580, arrival: 51420, runsOnReduced: false }, // 14:03 → 14:17
  { departure: 52800, arrival: 53640, runsOnReduced: true }, // 14:40 → 14:54
  { departure: 53700, arrival: 54540, runsOnReduced: false }, // 14:55 → 15:09
  { departure: 56400, arrival: 57240, runsOnReduced: true }, // 15:40 → 15:54
  { departure: 58800, arrival: 59640, runsOnReduced: false }, // 16:20 → 16:34
  { departure: 59400, arrival: 60360, runsOnReduced: true }, // 16:30 → 16:46
  { departure: 61800, arrival: 62760, runsOnReduced: false }, // 17:10 → 17:26
  { departure: 62700, arrival: 63660, runsOnReduced: true }, // 17:25 → 17:41
  { departure: 64500, arrival: 65460, runsOnReduced: false }, // 17:55 → 18:11
  { departure: 65700, arrival: 66660, runsOnReduced: true }, // 18:15 → 18:31
  { departure: 66900, arrival: 67860, runsOnReduced: false }, // 18:35 → 18:51
  { departure: 68100, arrival: 69060, runsOnReduced: true }, // 18:55 → 19:11
  { departure: 69600, arrival: 70440, runsOnReduced: false }, // 19:20 → 19:34
  { departure: 70800, arrival: 71640, runsOnReduced: true }, // 19:40 → 19:54
  { departure: 72660, arrival: 73500, runsOnReduced: true }, // 20:11 → 20:25
  { departure: 74700, arrival: 75540, runsOnReduced: false }, // 20:45 → 20:59
]

// ===== カラー定義（Reactアプリと同じ） =====
const COLORS = {
  background: '#242424',
  cardBackground: '#1a1a1a',
  cardNextBackground: '#2a2a4a',
  primary: '#646cff',
  arrival: '#535bf2',
  arrow: '#888888',
  text: '#ffffff',
  textMuted: '#888888',
  danger: '#ff4444',
  border: '#646cff',
}

// ===== ユーティリティ関数 =====
function getCurrentTimeInSeconds() {
  const now = new Date()
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
}

function formatTimeShort(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// 残り時間をHH:MM:SS形式でフォーマット（マイナス対応）
function formatRemaining(diffSeconds) {
  const isOverdue = diffSeconds < 0
  const absDiff = Math.abs(diffSeconds)

  const hours = Math.floor(absDiff / 3600)
  const minutes = Math.floor((absDiff % 3600) / 60)
  const secs = absDiff % 60

  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  return isOverdue ? `-${timeStr}` : timeStr
}

// 秒数から今日のDateオブジェクトを作成（isNextDayがtrueなら翌日）
function secondsToDate(seconds, isNextDay = false) {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (isNextDay) {
    date.setDate(date.getDate() + 1)
  }
  date.setSeconds(seconds)
  return date
}

// 残り時間が-5分以上のバスから3つ取得（全部終わったら翌日扱いで最初から3つ）
function getNextBuses(schedule, currentSeconds, count = 3) {
  const filtered = IS_REDUCED_SERVICE ? schedule.filter((bus) => bus.runsOnReduced) : schedule

  // 残り時間が-5分（-300秒）以上のバスを取得
  const upcoming = filtered.filter((bus) => bus.departure - currentSeconds >= -300)

  if (upcoming.length > 0) {
    return { buses: upcoming.slice(0, count), isNextDay: false }
  }

  // 全部終わったら翌日扱いで最初から3つ
  return { buses: filtered.slice(0, count), isNextDay: true }
}

// ===== ウィジェット作成 =====
async function createWidget() {
  const widget = new ListWidget()
  widget.backgroundColor = new Color(COLORS.background)
  widget.setPadding(10, 10, 10, 10)

  const currentTime = getCurrentTimeInSeconds()

  // ヘッダー: 運行状態と現在時刻（リアルタイム更新）
  const headerStack = widget.addStack()
  headerStack.layoutHorizontally()
  headerStack.centerAlignContent()

  const modeText = headerStack.addText(IS_REDUCED_SERVICE ? '減便運行' : '通常運行')
  modeText.font = Font.boldSystemFont(18)
  modeText.textColor = Color.white()

  headerStack.addSpacer(6)

  const divider = headerStack.addText('|')
  divider.font = Font.systemFont(18)
  divider.textColor = new Color('#444444')

  headerStack.addSpacer(6)

  const timeLabel = headerStack.addText('現在')
  timeLabel.font = Font.boldSystemFont(18)
  timeLabel.textColor = Color.white()

  headerStack.addSpacer(4)

  // リアルタイム更新される現在時刻（秒まで表示）
  // 今日の0:00:00からのタイマーとして表示することで HH:MM:SS 形式になる
  const today = new Date()
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
  const timeValue = headerStack.addDate(midnight)
  timeValue.applyTimerStyle()
  timeValue.font = Font.boldMonospacedSystemFont(18)
  timeValue.textColor = new Color(COLORS.primary)

  headerStack.addSpacer()

  widget.addSpacer(6)

  // 時刻表を横並びに配置
  const mainStack = widget.addStack()
  mainStack.layoutHorizontally()
  mainStack.spacing = 8

  // 新飯塚駅 → 九州工業大学（左側）
  const toKyutechData = getNextBuses(iizukaToKyutech, currentTime, 3)
  const leftColumn = mainStack.addStack()
  leftColumn.layoutVertically()
  addBusSection(
    leftColumn,
    '新飯塚駅 → 九工大',
    toKyutechData.buses,
    currentTime,
    toKyutechData.isNextDay
  )

  // 九州工業大学 → 新飯塚駅（右側）
  const toIizukaData = getNextBuses(kyutechToIizuka, currentTime, 3)
  const rightColumn = mainStack.addStack()
  rightColumn.layoutVertically()
  addBusSection(
    rightColumn,
    '九工大 → 新飯塚駅',
    toIizukaData.buses,
    currentTime,
    toIizukaData.isNextDay
  )

  return widget
}

function addBusSection(container, title, buses, currentTime, isNextDay = false) {
  // セクションタイトル
  const sectionTitle = container.addText(title)
  sectionTitle.font = Font.boldSystemFont(15)
  sectionTitle.textColor = Color.white()

  container.addSpacer(4)

  // 次のバス（まだ出発していない最初のバス）を見つける
  let nextBusIndex = -1
  for (let i = 0; i < buses.length; i++) {
    const remaining = isNextDay
      ? buses[i].departure + 86400 - currentTime
      : buses[i].departure - currentTime
    if (remaining >= 0) {
      nextBusIndex = i
      break
    }
  }

  // バス情報
  buses.forEach((bus, index) => {
    const isNext = index === nextBusIndex
    const remaining = isNextDay ? bus.departure + 86400 - currentTime : bus.departure - currentTime
    const isPast = remaining < 0
    const departureDate = secondsToDate(bus.departure, isNextDay)

    // カード風のスタック（過ぎたバスは透明度0.5）
    const cardStack = container.addStack()
    cardStack.layoutHorizontally()
    cardStack.centerAlignContent()
    cardStack.setPadding(4, 6, 4, 6)
    cardStack.cornerRadius = 6

    // 過ぎたバスは背景色を暗く
    if (isPast) {
      cardStack.backgroundColor = new Color('#2a2a2a', 0.5)
    } else if (isNext) {
      cardStack.backgroundColor = new Color(COLORS.cardNextBackground)
      cardStack.borderWidth = 1
      cardStack.borderColor = new Color(COLORS.border)
    } else {
      cardStack.backgroundColor = new Color(COLORS.cardBackground)
    }

    // 発車時刻 + 「発」（過ぎたら薄く）
    const depTime = cardStack.addText(`${formatTimeShort(bus.departure)}発`)
    depTime.font = Font.boldSystemFont(isNext ? 15 : 15)
    depTime.textColor = isPast ? new Color(COLORS.primary, 0.5) : new Color(COLORS.primary)
    depTime.lineLimit = 1

    cardStack.addSpacer()

    // 残り時間（リアルタイム更新）
    const remainingTimer = cardStack.addDate(departureDate)
    remainingTimer.applyTimerStyle()
    remainingTimer.font = Font.boldMonospacedSystemFont(isNext ? 15 : 15)
    remainingTimer.textColor = isPast ? new Color(COLORS.danger) : new Color(COLORS.primary)

    container.addSpacer(3)
  })
}

// ===== 次回更新時刻を計算 =====
function calculateNextRefreshDate(currentSeconds) {
  const allBuses = [...iizukaToKyutech, ...kyutechToIizuka]
  const filtered = IS_REDUCED_SERVICE ? allBuses.filter((bus) => bus.runsOnReduced) : allBuses

  const refreshTimes = []

  // 各バスに対して「発車1秒後」と「発車5分1秒後」をリストアップ
  filtered.forEach((bus) => {
    const afterDeparture = bus.departure + 1 // 発車1秒後
    const after5Min = bus.departure + 301 // 発車5分1秒後

    if (afterDeparture > currentSeconds) {
      refreshTimes.push(afterDeparture)
    }
    if (after5Min > currentSeconds) {
      refreshTimes.push(after5Min)
    }
  })

  // 一番近い更新時刻を取得
  if (refreshTimes.length > 0) {
    refreshTimes.sort((a, b) => a - b)
    const nextRefreshSeconds = refreshTimes[0]
    return secondsToDate(nextRefreshSeconds, false)
  }

  // すべて過ぎている場合は翌日の最初のバスの1秒後
  const tomorrow = filtered[0].departure + 1
  return secondsToDate(tomorrow, true)
}

// ===== メイン処理 =====
const widget = await createWidget()

// 次回更新時刻を設定iOSはタイミングが保証されない
const currentTime = getCurrentTimeInSeconds()
const nextRefresh = calculateNextRefreshDate(currentTime)
widget.refreshAfterDate = nextRefresh

if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  widget.presentMedium()
}

Script.complete()
