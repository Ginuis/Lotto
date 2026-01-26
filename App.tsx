
import React, { useState, useEffect } from 'react';
import { GameType, Grid, GameStats, FinanceRecord, AlgorithmWeights } from './types';
import { GAME_CONFIGS } from './constants';
import { generateGrids } from './services/lotoEngine';
import { getAnalysis } from './services/geminiService';
import { fetchGameStats } from './services/statsService';
import { GridCard } from './components/GridCard';
import { Disclaimer } from './components/Disclaimer';
import { DetailedStats } from './components/DetailedStats';
import { HistoryPanel } from './components/HistoryPanel';
import { FinanceTracker } from './components/FinanceTracker';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENERATE' | 'FINANCE'>('GENERATE');
  const [activeGame, setActiveGame] = useState<GameType>(GameType.EUROMILLIONS);
  const [dates, setDates] = useState<string[]>(['']);
  const [gridCount, setGridCount] = useState<number>(5);
  const [bonusGridCount, setBonusGridCount] = useState<number>(2);
  const [kenoNumCount, setKenoNumCount] = useState<number>(10);
  const [showExpertSettings, setShowExpertSettings] = useState(false);
  
  // Custom Algorithm Weights
  const [weights, setWeights] = useState<AlgorithmWeights>({
    hot: 0.5,
    cold: 0.5,
    trend: 0.5,
    synergy: 0.5
  });

  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>(() => {
    const saved = localStorage.getItem('loto_finance_records');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('loto_finance_records', JSON.stringify(financeRecords));
  }, [financeRecords]);

  const [gameStats, setGameStats] = useState<Record<GameType, GameStats | null>>({
    [GameType.EUROMILLIONS]: null,
    [GameType.EURODREAMS]: null,
    [GameType.LOTO]: null,
    [GameType.SUPER_LOTO]: null,
    [GameType.KENO]: null,
    [GameType.CRESCENDO]: null,
  });
  const [results, setResults] = useState<Record<GameType, Grid[] | null>>({
    [GameType.EUROMILLIONS]: null,
    [GameType.EURODREAMS]: null,
    [GameType.LOTO]: null,
    [GameType.SUPER_LOTO]: null,
    [GameType.KENO]: null,
    [GameType.CRESCENDO]: null,
  });
  const [analysis, setAnalysis] = useState<Record<GameType, string | null>>({
    [GameType.EUROMILLIONS]: null,
    [GameType.EURODREAMS]: null,
    [GameType.LOTO]: null,
    [GameType.SUPER_LOTO]: null,
    [GameType.KENO]: null,
    [GameType.CRESCENDO]: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  useEffect(() => {
    if (!gameStats[activeGame]) {
      setIsStatsLoading(true);
      fetchGameStats(activeGame).then(stats => {
        setGameStats(prev => ({ ...prev, [activeGame]: stats }));
        setIsStatsLoading(false);
      });
    }
  }, [activeGame]);

  const handleAddDate = () => { if (dates.length < 3) setDates([...dates, '']); };
  const handleUpdateDate = (index: number, val: string) => {
    const next = [...dates];
    next[index] = val;
    setDates(next);
  };
  const handleRemoveDate = (index: number) => setDates(dates.filter((_, i) => i !== index));

  const handleGenerate = async () => {
    setIsLoading(true);
    const config = GAME_CONFIGS[activeGame];
    const stats = gameStats[activeGame];
    // On passe les poids s'ils ont été modifiés manuellement
    const userWeights = showExpertSettings ? weights : undefined;
    const newGrids = generateGrids(config, dates.filter(d => d !== ''), gridCount, bonusGridCount, stats, activeGame, kenoNumCount, userWeights);
    
    setResults(prev => ({ ...prev, [activeGame]: newGrids }));
    const aiText = await getAnalysis(activeGame, newGrids);
    setAnalysis(prev => ({ ...prev, [activeGame]: aiText }));
    setIsLoading(false);
  };

  const handleAddFinance = (record: FinanceRecord) => {
    setFinanceRecords(prev => [...prev, record]);
  };

  const handleDeleteFinance = (id: string) => {
    setFinanceRecords(prev => prev.filter(r => r.id !== id));
  };

  const updateWeight = (key: keyof AlgorithmWeights, val: number) => {
    setWeights(prev => ({ ...prev, [key]: val }));
  };

  const currentGrids = results[activeGame];
  const currentAnalysis = analysis[activeGame];
  const currentStats = gameStats[activeGame];

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

          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveTab('GENERATE')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'GENERATE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Générateur
            </button>
            <button 
              onClick={() => setActiveTab('FINANCE')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'FINANCE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Mon Suivi
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        {activeTab === 'GENERATE' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-3 space-y-6">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-wrap gap-1 mb-6 bg-slate-50 p-1 rounded-xl">
                  {Object.values(GameType).map(type => (
                    <button
                      key={type}
                      onClick={() => setActiveGame(type)}
                      className={`flex-1 min-w-[60px] px-1 py-2 rounded-lg text-[8px] font-black transition-all uppercase tracking-tighter ${
                        activeGame === type 
                          ? 'bg-white text-slate-900 shadow-sm border border-slate-100' 
                          : 'text-slate-400 hover:text-slate-500'
                      }`}
                    >
                      {type === GameType.EUROMILLIONS ? 'EuroM' : 
                       type === GameType.EURODREAMS ? 'Dream' : 
                       type === GameType.LOTO ? 'Loto' : 
                       type === GameType.SUPER_LOTO ? 'Super' : 
                       type === GameType.KENO ? 'Keno' : 'Cresc'}
                    </button>
                  ))}
                </div>

                <h2 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-900">Configuration</h2>
                
                <div className="space-y-6">
                  {activeGame === GameType.KENO && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-lime-600 mb-2 block flex justify-between">
                        Numéros à cocher <span>{kenoNumCount}</span>
                      </label>
                      <input type="range" min="2" max="10" value={kenoNumCount} onChange={(e) => setKenoNumCount(parseInt(e.target.value))} className="w-full h-1.5 bg-lime-50 rounded-lg accent-lime-500 appearance-none cursor-pointer" />
                    </div>
                  )}

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
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <button 
                      onClick={() => setShowExpertSettings(!showExpertSettings)}
                      className="flex items-center justify-between w-full text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-600 transition-colors"
                    >
                      <span>Réglages Expert IA</span>
                      <svg className={`w-4 h-4 transform transition-transform ${showExpertSettings ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </button>
                    
                    {showExpertSettings && (
                      <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Numéros Chauds</span>
                            <span className="text-[9px] font-black text-slate-900">{(weights.hot * 100).toFixed(0)}%</span>
                          </div>
                          <input type="range" min="0" max="1" step="0.1" value={weights.hot} onChange={(e) => updateWeight('hot', parseFloat(e.target.value))} className="w-full h-1 bg-slate-100 rounded accent-orange-500 appearance-none cursor-pointer" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Numéros Froids</span>
                            <span className="text-[9px] font-black text-slate-900">{(weights.cold * 100).toFixed(0)}%</span>
                          </div>
                          <input type="range" min="0" max="1" step="0.1" value={weights.cold} onChange={(e) => updateWeight('cold', parseFloat(e.target.value))} className="w-full h-1 bg-slate-100 rounded accent-blue-500 appearance-none cursor-pointer" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Tendances IA</span>
                            <span className="text-[9px] font-black text-slate-900">{(weights.trend * 100).toFixed(0)}%</span>
                          </div>
                          <input type="range" min="0" max="1" step="0.1" value={weights.trend} onChange={(e) => updateWeight('trend', parseFloat(e.target.value))} className="w-full h-1 bg-slate-100 rounded accent-emerald-500 appearance-none cursor-pointer" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Synergie Paires</span>
                            <span className="text-[9px] font-black text-slate-900">{(weights.synergy * 100).toFixed(0)}%</span>
                          </div>
                          <input type="range" min="0" max="1" step="0.1" value={weights.synergy} onChange={(e) => updateWeight('synergy', parseFloat(e.target.value))} className="w-full h-1 bg-slate-100 rounded accent-purple-500 appearance-none cursor-pointer" />
                        </div>
                        <p className="text-[8px] text-slate-400 italic leading-tight">Ces poids influencent directement la probabilité de sélection de chaque numéro par l'algorithme.</p>
                      </div>
                    )}
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
                  <HistoryPanel 
                    history={currentStats.history} 
                    config={GAME_CONFIGS[activeGame]} 
                    currentGrids={currentGrids}
                    gameType={activeGame}
                  />
                ) : (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-100 w-1/2 rounded" />
                    <div className="h-20 bg-slate-50 rounded-xl" />
                    <div className="h-20 bg-slate-50 rounded-xl" />
                  </div>
                )}
              </section>
            </div>

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
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {currentGrids.map((grid, idx) => (
                      <GridCard 
                        key={idx} 
                        grid={grid} 
                        config={GAME_CONFIGS[activeGame]} 
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
        ) : (
          <FinanceTracker 
            records={financeRecords} 
            onAddRecord={handleAddFinance} 
            onDeleteRecord={handleDeleteFinance} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
