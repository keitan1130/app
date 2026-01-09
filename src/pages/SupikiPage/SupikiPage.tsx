import React, { useState, useEffect } from 'react';
import { Supiki } from '../../shared/ui';
import { useSupikiMovement, useSupikiVoice, createInitialSupiki } from '../../features/supiki';
import type { SupikiState } from '../../features/supiki';
import './SupikiPage.css';

export const SupikiPage: React.FC = () => {
  const [initialSupikis, setInitialSupikis] = useState<SupikiState[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // クライアントサイドでのみ初期化
    setInitialSupikis([createInitialSupiki()]);
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <div className="supiki-page" />;
  }

  return <SupikiPageContent initialSupikis={initialSupikis} />;
};

interface SupikiPageContentProps {
  initialSupikis: SupikiState[];
}

const SupikiPageContent: React.FC<SupikiPageContentProps> = ({ initialSupikis }) => {
  const { supikis, addSupiki } = useSupikiMovement(initialSupikis);
  const { playVoice } = useSupikiVoice();

  const handleSupikiClick = (supiki: SupikiState) => {
    // ボイスを順番に再生（falseで順番、trueでランダム）
    playVoice(false);

    // 同じ場所から新しいsupikiを追加
    addSupiki(supiki.x, supiki.y);
  };

  return (
    <div className="supiki-page">
      {supikis.map(supiki => (
        <Supiki
          key={supiki.id}
          x={supiki.x}
          y={supiki.y}
          direction={supiki.direction}
          onClick={() => handleSupikiClick(supiki)}
        />
      ))}
    </div>
  );
};
