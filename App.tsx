
import React, { useState, useEffect } from 'react';
import { GameType, Grid, GameStats } from './types';
import { GAME_CONFIGS } from './constants';
import { generateGrids } from './services/lotoEngine';
import { getAnalysis } from './services/geminiService';
import { fetchGameStats } from './services/statsService';
import { GridCard } from './components/GridCard';
import { Disclaimer } from './components/Disclaimer';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GameType>(GameType.EUROMILLIONS);
  const [dates, setDates] = useState<string[]>(['']);
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

  // Charger les stats quand on change de jeu
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
    const newGrids = generateGrids(config, dates.filter(d => d !== ''), 5, stats);
    
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
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Loto Stats & Crescendo</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Génération Data-Driven</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-1">
            {Object.values(GameType).map(type => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-tighter ${
                  activeTab === type 
                    ? 'bg-slate-900 text-white shadow-lg scale-105' 
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
          
          {/* Panel Gauche: Inputs & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Dates Clés
              </h2>
              <div className="space-y-3">
                {dates.map((date, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => handleUpdateDate(idx, e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    />
                    {dates.length > 1 && (
                      <button onClick={() => handleRemoveDate(idx)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                {dates.length < 3 && (
                  <button onClick={handleAddDate} className="w-full py-2 border-2 border-dashed border-slate-100 rounded-lg text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">
                    + Ajouter une date
                  </button>
                )}
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Tendances {activeTab}
              </h2>
              {isStatsLoading ? (
                <div className="flex justify-center py-4"><div className="animate-spin h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full" /></div>
              ) : currentStats ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Top 10 "Chauds"</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentStats.hotNumbers.map(n => (
                        <span key={n} className="w-6 h-6 rounded bg-emerald-50 text-emerald-700 text-[10px] flex items-center justify-center font-bold border border-emerald-100">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Les plus rares</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentStats.coldNumbers.map(n => (
                        <span key={n} className="w-6 h-6 rounded bg-slate-50 text-slate-500 text-[10px] flex items-center justify-center font-bold border border-slate-100">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center">Stats indisponibles</p>
              )}
            </section>

            <button
              onClick={handleGenerate}
              disabled={isLoading || isStatsLoading}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all transform active:scale-95 text-xs ${
                isLoading || isStatsLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
              }`}
            >
              Calculer les 5 Grilles
            </button>
          </div>

          {/* Panel Droite: Résultats */}
          <div className="lg:col-span-3 space-y-6">
            {!currentGrids ? (
              <div className="bg-white rounded-3xl p-20 border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 text-emerald-200">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-slate-800 font-bold text-xl uppercase tracking-tighter">Prêt pour le calcul ?</h3>
                <p className="text-slate-400 max-w-sm mt-2 text-sm">L'algorithme va fusionner vos dates avec les probabilités actuelles de la FDJ pour maximiser la couverture du spectre.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-end px-2">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Optimisation {activeTab}</h2>
                    <p className="text-[10px] text-emerald-600 font-black tracking-widest mt-0.5">MÉLANGE DATES + FREQUENCES</p>
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
                  <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Interprétation Probabiliste</h3>
                      <p className="text-xl leading-relaxed italic font-medium text-slate-100">"{currentAnalysis}"</p>
                    </div>
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
