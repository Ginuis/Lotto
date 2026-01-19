
import React from 'react';
import { GameStats } from '../types';

interface DetailedStatsProps {
  stats: GameStats;
}

export const DetailedStats: React.FC<DetailedStatsProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <section>
        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest border-b border-slate-100 pb-1">
          Tendances Récentes
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {stats.trends.slice(0, 9).map((trend, i) => (
            <div key={i} className="bg-slate-50 p-2 rounded-lg flex flex-col items-center justify-center border border-slate-100">
              <span className="text-xs font-bold text-slate-700">{trend.number}</span>
              <div className="flex items-center gap-1">
                {trend.direction === 'up' && <span className="text-[8px] text-emerald-500 font-bold">▲ {trend.change}</span>}
                {trend.direction === 'down' && <span className="text-[8px] text-rose-500 font-bold">▼ {trend.change}</span>}
                {trend.direction === 'stable' && <span className="text-[8px] text-slate-400 font-bold">●</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest border-b border-slate-100 pb-1">
          Paires Fréquentes
        </h4>
        <div className="space-y-1.5">
          {stats.frequentPairs.slice(0, 4).map(([n1, n2, count], i) => (
            <div key={i} className="flex justify-between items-center text-[10px] bg-white p-2 rounded border border-slate-100 shadow-sm">
              <div className="flex gap-1">
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">{n1}</span>
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">{n2}</span>
              </div>
              <span className="font-medium text-slate-400 italic">{count} sorties</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest border-b border-slate-100 pb-1">
          Triplés Or
        </h4>
        <div className="space-y-1.5">
          {stats.frequentTriplets.slice(0, 2).map(([n1, n2, n3, count], i) => (
            <div key={i} className="flex justify-between items-center text-[10px] bg-slate-900 text-white p-2 rounded shadow-lg border border-slate-800">
              <div className="flex gap-1">
                <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold">{n1}</span>
                <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold">{n2}</span>
                <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold">{n3}</span>
              </div>
              <span className="font-bold text-emerald-400">{count}x</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
