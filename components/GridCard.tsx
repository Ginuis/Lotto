
import React from 'react';
import { Grid, GameConfig } from '../types';
import { Ball } from './Ball';

interface GridCardProps {
  grid: Grid;
  config: GameConfig;
  index: number;
}

export const GridCard: React.FC<GridCardProps> = ({ grid, config, index }) => {
  const isWideSpectrum = index === 3;
  const hasBonus = config.bonusCount > 0;
  const multiplier = grid.multiplier;

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md ${isWideSpectrum ? 'border-indigo-300 ring-2 ring-indigo-50 bg-gradient-to-br from-white to-indigo-50/30' : 'border-slate-100'}`}>
      {isWideSpectrum && (
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-widest z-10 shadow-sm">
          Spectre Large
        </div>
      )}
      
      {multiplier && (
        <div className="absolute top-0 right-0 mt-8 mr-[-10px] bg-amber-400 text-amber-950 text-[10px] font-black px-4 py-1 rotate-12 shadow-sm border border-amber-500 z-10">
          Crescendo+ x{multiplier}
        </div>
      )}
      
      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${isWideSpectrum ? 'bg-indigo-500' : 'bg-slate-300'}`} />
          Combinaison #{index + 1}
        </span>
        <span className="text-[10px] text-slate-300 font-mono italic">
          Mise: {(config.price + (multiplier ? 1 : 0)).toFixed(2)}€
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-2">
          {grid.main.map((num, i) => (
            <Ball key={`main-${i}`} number={num} colorClass={config.color} />
          ))}
        </div>
        
        {hasBonus && (
          <>
            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />
            <div className="flex gap-2 items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mr-1">{config.bonusLabel}</span>
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
