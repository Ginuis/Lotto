
import React from 'react';
import { Grid, GameConfig } from '../types';
import { Ball } from './Ball';

interface GridCardProps {
  grid: Grid;
  config: GameConfig;
  index: number;
}

export const GridCard: React.FC<GridCardProps> = ({ grid, config, index }) => {
  const hasBonus = config.bonusCount > 0;

  const strategyColors = {
    'Mixte': 'bg-slate-500',
    'Chaud': 'bg-orange-500',
    'Froid': 'bg-blue-500'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md">
      <div className={`absolute top-0 right-0 ${strategyColors[grid.strategy]} text-white text-[8px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-widest z-10 shadow-sm`}>
        Algo: {grid.strategy}
      </div>
      
      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          Grille #{index + 1}
        </span>
        <span className="text-[10px] text-slate-300 font-mono italic">Mise: {config.price.toFixed(2)}€</span>
      </div>
      
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-2">
          {grid.main.map((num, i) => (
            <Ball key={`main-${i}`} number={num} colorClass={config.color} />
          ))}
        </div>
        
        {hasBonus && (
          <>
            <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block" />
            <div className="flex gap-2 items-center">
              {grid.bonus.map((num, i) => (
                <Ball key={`bonus-${i}`} number={num} colorClass={config.bonusColor} isBonus={true} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
