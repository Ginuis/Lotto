
import React from 'react';
import { GameStats } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface DetailedStatsProps {
  stats: GameStats;
}

export const DetailedStats: React.FC<DetailedStatsProps> = ({ stats }) => {
  // Préparer les données pour le graphique (Top 10 des fréquences)
  const chartData = Object.entries(stats.frequencies)
    .map(([num, freq]) => ({ 
      number: `N°${num}`, 
      // Fix: Explicitly convert freq to Number to prevent arithmetic operation errors in the sort function
      frequency: Number(freq),
      rawNum: parseInt(num)
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <section>
        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest border-b border-slate-100 pb-1">
          Histogramme des Fréquences (Top 10)
        </h4>
        <div className="h-48 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
              <XAxis 
                dataKey="number" 
                fontSize={8} 
                tickLine={false} 
                axisLine={false} 
                interval={0}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                fontSize={8} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white text-[10px] p-2 rounded shadow-xl border border-slate-700">
                        <p className="font-bold">{payload[0].payload.number}</p>
                        <p className="text-emerald-400">{payload[0].value} sorties</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="frequency" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? '#10b981' : '#334155'} 
                    fillOpacity={1 - index * 0.08}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

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
