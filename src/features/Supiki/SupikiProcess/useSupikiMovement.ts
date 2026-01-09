import { useState, useEffect, useCallback, useRef } from 'react';
import type { SupikiState } from './types';

const SPEED = 1.5;
const DIRECTION_CHANGE_INTERVAL = 3000; // 3秒ごとに方向変更の可能性

const getRandomPosition = (max: number, size: number) => {
  return Math.random() * (max - size);
};

const getNewTarget = (currentX: number, currentY: number, windowWidth: number, windowHeight: number, size: number) => {
  // 現在位置からランダムな距離を移動
  const maxDistance = 300;
  const minDistance = 100;

  const distance = minDistance + Math.random() * (maxDistance - minDistance);
  const angle = Math.random() * 2 * Math.PI;

  let targetX = currentX + Math.cos(angle) * distance;
  let targetY = currentY + Math.sin(angle) * distance;

  // 画面内に収める
  targetX = Math.max(0, Math.min(windowWidth - size, targetX));
  targetY = Math.max(0, Math.min(windowHeight - size, targetY));

  return { targetX, targetY };
};

export const useSupikiMovement = (initialSupikis: SupikiState[]) => {
  const [supikis, setSupikis] = useState<SupikiState[]>(initialSupikis);
  const nextIdRef = useRef(initialSupikis.length + 1);

  // 新しいターゲットを設定
  const updateTargets = useCallback(() => {
    setSupikis(prev => prev.map(supiki => {
      const size = 100;
      const { targetX, targetY } = getNewTarget(
        supiki.x,
        supiki.y,
        window.innerWidth,
        window.innerHeight,
        size
      );
      return { ...supiki, targetX, targetY };
    }));
  }, []);

  // 移動処理
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setSupikis(prev => prev.map(supiki => {
        const dx = supiki.targetX - supiki.x;
        const dy = supiki.targetY - supiki.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < SPEED) {
          return supiki;
        }

        const newX = supiki.x + (dx / distance) * SPEED;
        const newY = supiki.y + (dy / distance) * SPEED;

        // 移動方向に基づいて向きを決定（頻度を減らすため閾値を設ける）
        let newDirection = supiki.direction;
        if (Math.abs(dx) > 30) {
          newDirection = dx < 0 ? 'left' : 'right';
        }

        return {
          ...supiki,
          x: newX,
          y: newY,
          direction: newDirection,
        };
      }));
    }, 16);

    return () => clearInterval(moveInterval);
  }, []);

  // 定期的に新しいターゲットを設定
  useEffect(() => {
    const targetInterval = setInterval(updateTargets, DIRECTION_CHANGE_INTERVAL);
    updateTargets(); // 初回実行
    return () => clearInterval(targetInterval);
  }, [updateTargets]);

  // supikiを追加
  const addSupiki = useCallback((x: number, y: number) => {
    const newId = nextIdRef.current++;
    const size = 100;
    const { targetX, targetY } = getNewTarget(x, y, window.innerWidth, window.innerHeight, size);

    setSupikis(prev => [
      ...prev,
      {
        id: newId,
        x,
        y,
        direction: 'right' as const,
        targetX,
        targetY,
      }
    ]);
  }, []);

  return { supikis, addSupiki };
};

export const createInitialSupiki = (): SupikiState => {
  const size = 100;
  const x = getRandomPosition(window.innerWidth, size);
  const y = getRandomPosition(window.innerHeight, size);
  const { targetX, targetY } = getNewTarget(x, y, window.innerWidth, window.innerHeight, size);

  return {
    id: 1,
    x,
    y,
    direction: 'right',
    targetX,
    targetY,
  };
};
