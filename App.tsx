
import React, { useState, useEffect } from 'react';
import { GameType, Grid, GameStats } from './types';
import { GAME_CONFIGS } from './constants';
import { generateGrids } from './services/lotoEngine';
import { getAnalysis } from './services/geminiService';
import { fetchGameStats } from './services/statsService';
import { GridCard } from './components/GridCard';
import { Disclaimer } from './components/Disclaimer';
import { DetailedStats } from './components/DetailedStats';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GameType>(GameType.EUROMILLIONS);
  const [dates, setDates] = useState<string[]>(['']);
  const [gridCount, setGridCount] = useState<number>(5);
  
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
    const newGrids = generateGrids(config, dates.filter(d => d !== ''), gridCount, stats);
    
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Loto Predictor Pro</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Multi-Algorithm Engine</p>
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

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Panel Gauche */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-400">Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Nombre de grilles ({gridCount})</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={gridCount}
                    onChange={(e) => setGridCount(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-300 mt-1">
                    <span>1</span>
                    <span>10</span>
                    <span>20</span>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Dates Influenceuses</label>
                  <div className="space-y-2">
                    {dates.map((date, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => handleUpdateDate(idx, e.target.value)}
                          className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        {dates.length > 1 && (
                          <button onClick={() => handleRemoveDate(idx)} className="text-slate-300 hover:text-red-500">×</button>
                        )}
                      </div>
                    ))}
                    {dates.length < 3 && (
                      <button onClick={handleAddDate} className="text-[9px] font-bold text-emerald-600 uppercase">+ Date</button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <button
              onClick={handleGenerate}
              disabled={isLoading || isStatsLoading}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all transform active:scale-95 text-xs ${
                isLoading || isStatsLoading ? 'bg-slate-300' : 'bg-slate-900 text-white hover:bg-black'
              }`}
            >
              {isLoading ? 'Calcul en cours...' : 'Générer Grilles'}
            </button>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Expert Analytics</h2>
                {isStatsLoading && <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
              </div>
              
              {!isStatsLoading && currentStats ? (
                <DetailedStats stats={currentStats} />
              ) : (
                <div className="space-y-4">
                   <div className="h-20 bg-slate-50 animate-pulse rounded-xl" />
                   <div className="h-32 bg-slate-50 animate-pulse rounded-xl" />
                </div>
              )}
            </section>
          </div>

          {/* Panel Droite */}
          <div className="lg:col-span-3 space-y-6">
            {!currentGrids ? (
              <div className="bg-white rounded-3xl p-16 border border-slate-200 border-dashed text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-slate-900 font-bold text-lg">Prêt pour le tirage ?</h3>
                <p className="text-slate-400 text-sm mt-1">L'IA est prête à analyser vos grilles basées sur les dernières paires et triplés.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-xl font-black text-slate-900 uppercase">Grilles {activeTab}</h2>
                  <div className="flex items-center gap-4">
                     <span className="text-[10px] font-bold text-slate-400 px-3 py-1 bg-white rounded-full border border-slate-100 uppercase tracking-widest">
                       {gridCount} Combinaisons
                     </span>
                     <span className="text-[10px] font-bold text-slate-400">Coût total: {(GAME_CONFIGS[activeTab].price * gridCount).toFixed(2)}€</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                    <h3 className="text-emerald-400 text-[9px] font-black uppercase tracking-[0.3em] mb-3 relative z-10">L'Analyse de l'IA</h3>
                    <p className="text-lg leading-relaxed italic font-medium relative z-10">"{currentAnalysis}"</p>
                  </div>
                )}
              </div>
            )}
            
            <Disclaimer />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
