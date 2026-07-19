export interface SupikiState {
  id: number
  x: number
  y: number
  direction: 'left' | 'right'
  targetX: number
  targetY: number
  animationDelay: number
  nextTargetTime: number
  isMoving: boolean
  isRare: boolean
}
