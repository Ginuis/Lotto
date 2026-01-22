
import React from 'react';
import { WinningDraw, GameConfig } from '../types';

interface HistoryPanelProps {
  history: WinningDraw[];
  config: GameConfig;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, config }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2 flex justify-between items-center">
        <span>Historique des 10 derniers tirages</span>
        <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">Réalité vs Analyse</span>
      </h3>
      
      <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        {history.map((draw, idx) => (
          <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 hover:border-slate-200 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-400">{draw.date}</span>
              {draw.joker && (
                <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase">
                  Joker+: {draw.joker}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1.5 items-center">
              <div className="flex gap-1 flex-wrap">
                {draw.numbers.map((n, i) => (
                  <span key={i} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shadow-sm">
                    {n}
                  </span>
                ))}
              </div>
              
              {draw.bonus.length > 0 && (
                <div className="flex gap-1 border-l border-slate-200 pl-1.5 ml-1">
                  {draw.bonus.map((n, i) => (
                    <span key={i} className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                      {n}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
