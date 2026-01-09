import React from 'react';
import supikiImage from '../../../assets/supiki.png';
import './Supiki.css';

interface SupikiProps {
  x: number;
  y: number;
  direction: 'left' | 'right';
  onClick: () => void;
}

export const Supiki: React.FC<SupikiProps> = ({ x, y, direction, onClick }) => {
  return (
    <div
      className="supiki"
      style={{
        left: x,
        top: y,
        transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
      }}
      onClick={onClick}
    >
      <img src={supikiImage} alt="Supiki" className="supiki-image" />
    </div>
  );
};
