
import React from 'react';
import { WinningDraw, GameConfig, Grid, GameType } from '../types';

interface HistoryPanelProps {
  history: WinningDraw[];
  config: GameConfig;
  currentGrids: Grid[] | null;
  gameType: GameType;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, config, currentGrids, gameType }) => {
  // Calculer la correspondance du Joker (nombre de chiffres identiques à la même place)
  const calculateJokerMatch = (generated?: string, historical?: string): number => {
    if (!generated || !historical) return 0;
    let match = 0;
    const minLen = Math.min(generated.length, historical.length);
    for (let i = 0; i < minLen; i++) {
      if (generated[i] === historical[i]) match++;
    }
    return match;
  };

  /**
   * Détermine si une grille est gagnante selon les règles simplifiées du jeu
   */
  const checkWinningTier = (main: number, bonus: number, joker: number): { win: boolean; type: 'Refund' | 'Win' | 'None' } => {
    if (joker >= 1) return { win: true, type: 'Win' };

    switch (gameType) {
      case GameType.EUROMILLIONS:
        // EuroMillions gagne à partir de 2 numéros OU 2 étoiles OU 1 numéro + 2 étoiles
        if ((main >= 2) || (bonus >= 2) || (main >= 1 && bonus >= 2)) {
          return { win: true, type: main === 2 && bonus === 0 ? 'Refund' : 'Win' };
        }
        break;
      case GameType.LOTO:
        // Loto gagne avec le N° Chance OU 2 numéros
        if (bonus >= 1 || main >= 2) {
          return { win: true, type: bonus >= 1 && main < 2 ? 'Refund' : 'Win' };
        }
        break;
      case GameType.EURODREAMS:
        // EuroDreams gagne à partir de 2 numéros
        if (main >= 2) return { win: true, type: 'Win' };
        break;
      case GameType.CRESCENDO:
        if (main >= 3) return { win: true, type: 'Win' };
        break;
    }

    return { win: false, type: 'None' };
  };

  // Calculer les statistiques de performance globale sur les 6 derniers tirages
  const getGlobalStats = () => {
    if (!currentGrids || currentGrids.length === 0) return null;
    
    const last6 = history.slice(0, 6);
    let potentialWins = 0;
    let maxMatch = 0;
    const uniqueNumbersFound = new Set<number>();

    last6.forEach(draw => {
      let drawBestMatch = 0;
      let hasAnyWinOnDraw = false;

      currentGrids.forEach(grid => {
        const matches = grid.main.filter(n => draw.numbers.includes(n)).length;
        const bonusMatches = grid.bonus.filter(n => draw.bonus.includes(n)).length;
        const jokerMatch = calculateJokerMatch(grid.joker, draw.joker);
        
        const tier = checkWinningTier(matches, bonusMatches, jokerMatch);
        if (tier.win) hasAnyWinOnDraw = true;

        if (matches > drawBestMatch) drawBestMatch = matches;
        grid.main.filter(n => draw.numbers.includes(n)).forEach(n => uniqueNumbersFound.add(n));
      });

      if (hasAnyWinOnDraw) potentialWins++;
      if (drawBestMatch > maxMatch) maxMatch = drawBestMatch;
    });

    return {
      efficiency: Math.round((uniqueNumbersFound.size / (config.mainMax)) * 100),
      potentialDrawsWithWin: potentialWins,
      record: maxMatch
    };
  };

  const getBestMatch = (draw: WinningDraw) => {
    if (!currentGrids || currentGrids.length === 0) return null;

    let best = { main: 0, bonus: 0, joker: 0, total: -1, gridIndex: -1, winTier: 'None' as 'Refund' | 'Win' | 'None' };

    currentGrids.forEach((grid, idx) => {
      const matchMain = grid.main.filter(n => draw.numbers.includes(n)).length;
      const matchBonus = grid.bonus.filter(n => draw.bonus.includes(n)).length;
      const matchJoker = calculateJokerMatch(grid.joker, draw.joker);
      
      const score = matchMain + (matchBonus * 1.1) + (matchJoker * 1.5);
      const tier = checkWinningTier(matchMain, matchBonus, matchJoker);

      if (score > best.total || (tier.win && best.winTier === 'None')) {
        best = { 
          main: matchMain, 
          bonus: matchBonus, 
          joker: matchJoker, 
          total: score, 
          gridIndex: idx,
          winTier: tier.type
        };
      }
    });

    return best;
  };

  const globalStats = getGlobalStats();

  return (
    <div className="space-y-4">
      {/* Section Performance Globale */}
      {globalStats && (
        <div className="bg-slate-900 rounded-xl p-3 text-white mb-6 border border-slate-800 shadow-inner">
          <div className="text-[8px] font-black uppercase text-emerald-400 tracking-[0.2em] mb-2">Simulateur de Rentabilité (6T)</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-lg font-black text-white">{globalStats.efficiency}%</div>
              <div className="text-[7px] uppercase text-slate-500 font-bold">Couverture</div>
            </div>
            <div className="text-center border-x border-slate-800">
              <div className="text-lg font-black text-emerald-400">{globalStats.potentialDrawsWithWin}/6</div>
              <div className="text-[7px] uppercase text-slate-500 font-bold">Tirages Primés</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-amber-400">{globalStats.record}</div>
              <div className="text-[7px] uppercase text-slate-500 font-bold">Max N° Trouvés</div>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2 flex justify-between items-center">
        <span>Historique Détaillé</span>
        <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">Backtest</span>
      </h3>
      
      <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        {history.map((draw, idx) => {
          const match = idx < 6 ? getBestMatch(draw) : null;
          const isWinning = match && match.winTier !== 'None';
          
          return (
            <div key={idx} className={`border rounded-xl p-3 transition-all relative group ${
              isWinning ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400">{draw.date}</span>
                {draw.joker && (
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Joker+ Officiel</span>
                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-widest">
                      {draw.joker}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1.5 items-center">
                <div className="flex gap-1 flex-wrap">
                  {draw.numbers.map((n, i) => {
                    const isMatched = match && currentGrids?.[match.gridIndex].main.includes(n);
                    return (
                      <span key={i} className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shadow-sm transition-colors ${
                        isMatched ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-slate-200 text-slate-700'
                      }`}>
                        {n}
                      </span>
                    );
                  })}
                </div>
                
                {draw.bonus.length > 0 && (
                  <div className="flex gap-1 border-l border-slate-200 pl-1.5 ml-1">
                    {draw.bonus.map((n, i) => {
                       const isMatched = match && currentGrids?.[match.gridIndex].bonus.includes(n);
                       return (
                        <span key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                          isMatched ? 'bg-amber-600 scale-110 ring-2 ring-amber-200' : 'bg-amber-400'
                        }`}>
                          {n}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section Simulation Gain */}
              {match && (
                <div className="mt-3 pt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">
                      Top Performance Grille #{match.gridIndex + 1}
                    </span>
                    {isWinning && (
                      <span className="text-[7px] font-bold text-emerald-600 uppercase">Rang de gain atteint</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        match.main >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {match.main} N°
                      </span>
                      {match.bonus > 0 && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          (gameType === GameType.LOTO && match.bonus >= 1) || (gameType === GameType.EUROMILLIONS && match.bonus >= 2)
                          ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {match.bonus} B
                        </span>
                      )}
                      {match.joker > 0 && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white animate-pulse">
                          J+ {match.joker}
                        </span>
                      )}
                    </div>
                    {isWinning && (
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                        match.winTier === 'Refund' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700 animate-pulse'
                      }`}>
                        {match.winTier === 'Refund' ? 'Remboursé' : 'Gagné'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
