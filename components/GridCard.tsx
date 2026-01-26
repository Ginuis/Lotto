
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
  const isExpert = grid.strategy === 'Expert (Bonus)';

  const strategyColors = {
    'Mixte': 'bg-slate-500',
    'Chaud': 'bg-orange-500',
    'Froid': 'bg-blue-500',
    'Expert (Bonus)': 'bg-emerald-600'
  };

  return (
    <div className={`p-6 rounded-2xl shadow-sm border transition-all hover:shadow-lg flex flex-col gap-4 relative overflow-hidden ${
      isExpert ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'
    }`}>
      {isExpert && (
        <div className="absolute -left-12 top-6 -rotate-45 bg-emerald-600 text-[8px] text-white font-black py-1 px-12 uppercase tracking-widest shadow-sm">
          Expert
        </div>
      )}
      
      <div className={`absolute top-0 right-0 ${strategyColors[grid.strategy as keyof typeof strategyColors]} text-white text-[8px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-widest z-10 shadow-sm`}>
        {grid.strategy}
      </div>
      
      <div className="flex justify-between items-center border-b border-black/5 pb-2 ml-4">
        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${isExpert ? 'bg-emerald-400' : 'bg-slate-300'}`} />
          Grille #{index + 1}
        </span>
        <span className="text-[10px] text-slate-300 font-mono italic">Mise: {config.price.toFixed(2)}€</span>
      </div>
      
      <div className="flex flex-wrap gap-3 items-center ml-4">
        <div className="flex flex-wrap gap-2">
          {grid.main.map((num, i) => (
            <Ball key={`main-${i}`} number={num} colorClass={isExpert ? 'bg-emerald-700' : config.color} />
          ))}
        </div>
        
        {hasBonus && (
          <>
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
            <div className="flex gap-2 items-center">
              {grid.bonus.map((num, i) => (
                <Ball key={`bonus-${i}`} number={num} colorClass={config.bonusColor} isBonus={true} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between items-center mt-2 ml-4">
        <div className="flex gap-4">
          {grid.joker && (
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Joker+ Généré</span>
              <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 tracking-widest shadow-inner">
                {grid.joker}
              </span>
            </div>
          )}
          {isExpert && (
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Optimisation</span>
              <div className="text-[9px] text-emerald-700 font-bold uppercase flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Plages équilibrées
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
