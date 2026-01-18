
import React from 'react';

interface BallProps {
  number: number;
  isBonus?: boolean;
  colorClass: string;
}

export const Ball: React.FC<BallProps> = ({ number, isBonus, colorClass }) => {
  return (
    <div className={`
      flex items-center justify-center
      ${isBonus ? 'w-10 h-10' : 'w-12 h-12'}
      rounded-full shadow-lg text-white font-bold text-lg
      transform transition-all hover:scale-110
      ${colorClass}
      ${isBonus ? 'clip-star rotate-0 hover:rotate-12' : ''}
    `}
    style={isBonus ? { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' } : {}}
    >
      <span className={isBonus ? 'mt-1' : ''}>{number}</span>
    </div>
  );
};
