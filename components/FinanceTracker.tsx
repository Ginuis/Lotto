
import React, { useState, useMemo } from 'react';
import { FinanceRecord, GameType } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface FinanceTrackerProps {
  records: FinanceRecord[];
  onAddRecord: (record: FinanceRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const FinanceTracker: React.FC<FinanceTrackerProps> = ({ records, onAddRecord, onDeleteRecord }) => {
  const [gameType, setGameType] = useState<GameType>(GameType.LOTO);
  const [investment, setInvestment] = useState<string>('2.20');
  const [winnings, setWinnings] = useState<string>('0');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const stats = useMemo(() => {
    const totalInvested = records.reduce((acc, curr) => acc + curr.investment, 0);
    const totalWon = records.reduce((acc, curr) => acc + curr.winnings, 0);
    const balance = totalWon - totalInvested;
    const roi = totalInvested > 0 ? (totalWon / totalInvested) * 100 : 0;
    
    // Données cumulées pour le graphique
    let cumulInvest = 0;
    let cumulWin = 0;
    const chartData = records
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(r => {
        cumulInvest += r.investment;
        cumulWin += r.winnings;
        return {
          date: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          investi: cumulInvest,
          gagne: cumulWin,
          profit: cumulWin - cumulInvest
        };
      });

    return { totalInvested, totalWon, balance, roi, chartData };
  }, [records]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRecord({
      id: crypto.randomUUID(),
      date,
      gameType,
      investment: parseFloat(investment) || 0,
      winnings: parseFloat(winnings) || 0
    });
    setWinnings('0');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Investi</p>
          <p className="text-2xl font-black text-slate-900">{stats.totalInvested.toFixed(2)}€</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Gains</p>
          <p className="text-2xl font-black text-emerald-600">{stats.totalWon.toFixed(2)}€</p>
        </div>
        <div className={`p-6 rounded-3xl border shadow-sm ${stats.balance >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Balance Nette</p>
          <p className={`text-2xl font-black ${stats.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {stats.balance >= 0 ? '+' : ''}{stats.balance.toFixed(2)}€
          </p>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">ROI Global</p>
          <p className="text-2xl font-black text-emerald-400">{stats.roi.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest mb-6">Nouvelle Session</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Jeu</label>
              <select value={gameType} onChange={(e) => setGameType(e.target.value as GameType)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500">
                {Object.values(GameType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Mise (€)</label>
                <input type="number" step="0.10" value={investment} onChange={(e) => setInvestment(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Gain (€)</label>
                <input type="number" step="0.10" value={winnings} onChange={(e) => setWinnings(e.target.value)} className="w-full bg-emerald-50 border-none rounded-xl px-4 py-3 text-sm text-emerald-700 font-bold" />
              </div>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl hover:bg-black transition-all mt-4">
              Enregistrer la session
            </button>
          </form>
        </div>

        {/* Graphique */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest mb-6">Évolution de la Performance</h3>
          <div className="h-64 w-full">
            {records.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                  <Line type="monotone" dataKey="investi" stroke="#94a3b8" strokeDasharray="5 5" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                <p className="text-[10px] font-bold uppercase tracking-widest">Enregistrez au moins 2 sessions pour voir le graphique</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Liste des transactions */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Date</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Jeu</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Mise</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Gain</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Résultat</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
              <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-xs font-bold text-slate-600">{new Date(record.date).toLocaleDateString('fr-FR')}</td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded-full uppercase text-slate-600">{record.gameType}</span>
                </td>
                <td className="px-6 py-4 text-xs text-right text-slate-500">{record.investment.toFixed(2)}€</td>
                <td className="px-6 py-4 text-xs text-right font-bold text-emerald-600">{record.winnings.toFixed(2)}€</td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-xs font-black ${(record.winnings - record.investment) >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {(record.winnings - record.investment).toFixed(2)}€
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onDeleteRecord(record.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
