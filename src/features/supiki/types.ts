export interface SupikiState {
  id: number;
  x: number;
  y: number;
  direction: 'left' | 'right';
  targetX: number;
  targetY: number;
}
