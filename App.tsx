
import React, { useState, useEffect } from 'react';
import { GameType, Grid, GameStats } from './types';
import { GAME_CONFIGS } from './constants';
import { generateGrids } from './services/lotoEngine';
import { getAnalysis } from './services/geminiService';
import { fetchGameStats } from './services/statsService';
import { GridCard } from './components/GridCard';
import { Disclaimer } from './components/Disclaimer';
import { DetailedStats } from './components/DetailedStats';
import { HistoryPanel } from './components/HistoryPanel';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GameType>(GameType.EUROMILLIONS);
  const [dates, setDates] = useState<string[]>(['']);
  const [gridCount, setGridCount] = useState<number>(5);
  const [bonusGridCount, setBonusGridCount] = useState<number>(2);
  
  const [gameStats, setGameStats] = useState<Record<GameType, GameStats | null>>({
    [GameType.EUROMILLIONS]: null,
    [GameType.EURODREAMS]: null,
    [GameType.LOTO]: null,
    [GameType.CRESCENDO]: null,
  });
  const [results, setResults] = useState<Record<GameType, Grid[] | null>>({
    [GameType.EUROMILLIONS]: null,
    [GameType.EURODREAMS]: null,
    [GameType.LOTO]: null,
    [GameType.CRESCENDO]: null,
  });
  const [analysis, setAnalysis] = useState<Record<GameType, string | null>>({
    [GameType.EUROMILLIONS]: null,
    [GameType.EURODREAMS]: null,
    [GameType.LOTO]: null,
    [GameType.CRESCENDO]: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  useEffect(() => {
    if (!gameStats[activeTab]) {
      setIsStatsLoading(true);
      fetchGameStats(activeTab).then(stats => {
        setGameStats(prev => ({ ...prev, [activeTab]: stats }));
        setIsStatsLoading(false);
      });
    }
  }, [activeTab]);

  const handleAddDate = () => { if (dates.length < 3) setDates([...dates, '']); };
  const handleUpdateDate = (index: number, val: string) => {
    const next = [...dates];
    next[index] = val;
    setDates(next);
  };
  const handleRemoveDate = (index: number) => setDates(dates.filter((_, i) => i !== index));

  const handleGenerate = async () => {
    setIsLoading(true);
    const config = GAME_CONFIGS[activeTab];
    const stats = gameStats[activeTab];
    // Nouveau moteur avec grilles bonus expertes
    const newGrids = generateGrids(config, dates.filter(d => d !== ''), gridCount, bonusGridCount, stats);
    
    setResults(prev => ({ ...prev, [activeTab]: newGrids }));
    const aiText = await getAnalysis(activeTab, newGrids);
    setAnalysis(prev => ({ ...prev, [activeTab]: aiText }));
    setIsLoading(false);
  };

  const currentGrids = results[activeTab];
  const currentAnalysis = analysis[activeTab];
  const currentStats = gameStats[activeTab];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Loto Predictor Pro</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Expert Statistical Intelligence</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-1">
            {Object.values(GameType).map(type => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-tighter ${
                  activeTab === type 
                    ? 'bg-emerald-600 text-white shadow-lg scale-105' 
                    : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Panel Gauche: Config & Historique */}
          <div className="lg:col-span-3 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-900">Configuration</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block flex justify-between">
                    Grilles Standard <span>{gridCount}</span>
                  </label>
                  <input type="range" min="1" max="15" value={gridCount} onChange={(e) => setGridCount(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg accent-emerald-600 appearance-none cursor-pointer" />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-emerald-600 mb-2 block flex justify-between">
                    Grilles Bonus Stratégiques <span>{bonusGridCount}</span>
                  </label>
                  <input type="range" min="0" max="5" value={bonusGridCount} onChange={(e) => setBonusGridCount(parseInt(e.target.value))} className="w-full h-1.5 bg-emerald-50 rounded-lg accent-emerald-500 appearance-none cursor-pointer" />
                  <p className="text-[9px] text-slate-400 mt-2 leading-tight">Optimisées par l'historique et la distribution des plages.</p>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Dates Influenceuses</label>
                  <div className="space-y-2">
                    {dates.map((date, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input type="date" value={date} onChange={(e) => handleUpdateDate(idx, e.target.value)} className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500" />
                        {dates.length > 1 && <button onClick={() => handleRemoveDate(idx)} className="text-slate-300 hover:text-red-500">×</button>}
                      </div>
                    ))}
                    {dates.length < 3 && <button onClick={handleAddDate} className="text-[9px] font-bold text-emerald-600 uppercase">+ Date</button>}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading || isStatsLoading}
                className={`w-full mt-6 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all transform active:scale-95 text-xs ${
                  isLoading || isStatsLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black shadow-emerald-200'
                }`}
              >
                {isLoading ? 'Calcul intelligent...' : 'Générer Grilles'}
              </button>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              {currentStats ? (
                <HistoryPanel history={currentStats.history} config={GAME_CONFIGS[activeTab]} />
              ) : (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-slate-100 w-1/2 rounded" />
                  <div className="h-20 bg-slate-50 rounded-xl" />
                  <div className="h-20 bg-slate-50 rounded-xl" />
                </div>
              )}
            </section>
          </div>

          {/* Panel Central: Résultats */}
          <div className="lg:col-span-6 space-y-6">
            {!currentGrids ? (
              <div className="bg-white rounded-3xl p-16 border border-slate-200 border-dashed text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.364-6.364l-.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 12.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
                  </svg>
                </div>
                <h3 className="text-slate-900 font-bold text-lg italic">Prêt pour une analyse data-driven ?</h3>
                <p className="text-slate-400 text-sm mt-1">L'IA intègre désormais les patterns de distribution et l'historique pour équilibrer vos combinaisons.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Votre Tirage Optimisé</h2>
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-black text-white bg-emerald-500 px-2 py-1 rounded uppercase">
                       {currentGrids.filter(g => g.strategy === 'Expert (Bonus)').length} Bonus Expertes
                     </span>
                     <span className="text-[10px] font-bold text-slate-400">Total: {(GAME_CONFIGS[activeTab].price * currentGrids.length).toFixed(2)}€</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {currentGrids.map((grid, idx) => (
                    <GridCard 
                      key={idx} 
                      grid={grid} 
                      config={GAME_CONFIGS[activeTab]} 
                      index={idx}
                    />
                  ))}
                </div>

                {currentAnalysis && (
                  <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 rounded-full -mr-24 -mt-24 opacity-20 blur-3xl" />
                    <h3 className="text-emerald-400 text-[9px] font-black uppercase tracking-[0.3em] mb-4">L'Analyse Strategy-First</h3>
                    <p className="text-lg leading-relaxed italic font-medium">"{currentAnalysis}"</p>
                  </div>
                )}
              </div>
            )}
            
            <Disclaimer />
          </div>

          {/* Panel Droit: Stats & Graphiques */}
          <div className="lg:col-span-3">
             <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center justify-between">
                  Expert Analytics
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h2>
                {!isStatsLoading && currentStats ? (
                  <DetailedStats stats={currentStats} />
                ) : (
                  <div className="space-y-6">
                     <div className="h-40 bg-slate-50 animate-pulse rounded-xl" />
                     <div className="h-40 bg-slate-50 animate-pulse rounded-xl" />
                  </div>
                )}
             </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
