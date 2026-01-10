export interface SupikiState {
  id: number
  x: number
  y: number
  direction: 'left' | 'right'
  targetX: number
  targetY: number
  animationDelay: number // 歩行アニメーションの遅延（秒）
  nextTargetTime: number // 次の目標地点変更時刻（ミリ秒）
  isMoving: boolean // 移動中かどうか
}
