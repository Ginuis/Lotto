
import { GameConfig, Grid, GameStats, StrategyType, GameType } from '../types';

const extractNumbersFromDates = (dates: string[]): number[] => {
  const pool: number[] = [];
  dates.forEach(dateStr => {
    if (!dateStr) return;
    const date = new Date(dateStr);
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    pool.push(d, m, parseInt(y.toString().slice(-2)), d + m);
    const digits = (d.toString() + m.toString() + y.toString()).split('').map(Number);
    pool.push(...digits.filter(n => n > 0));
  });
  return pool;
};

const generateJoker = (): string => {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

/**
 * Analyse la distribution actuelle pour forcer un étalement sur les dizaines
 */
const getRangeIncentive = (num: number, currentSelection: number[], max: number): number => {
  const decade = Math.floor((num - 1) / 10);
  const alreadyInDecade = currentSelection.filter(n => Math.floor((n - 1) / 10) === decade).length;
  // Si on a déjà trop de numéros dans cette dizaine, on réduit le poids
  return alreadyInDecade > 1 ? 0.1 : 2.0;
};

const getWeightedRandom = (
  max: number, 
  excluded: Set<number>, 
  stats: GameStats | null, 
  strategy: StrategyType,
  currentSelection: number[] = []
): number => {
  if (!stats) {
    let num;
    do { num = Math.floor(Math.random() * max) + 1; } while (excluded.has(num));
    return num;
  }

  const weightedPool: number[] = [];
  const freqValues = Object.values(stats.frequencies);
  const minFreq = Math.min(...freqValues);
  const maxFreq = Math.max(...freqValues);

  const synergyBoosts: Record<number, number> = {};
  if (strategy !== 'Froid') {
    stats.frequentPairs.forEach(([n1, n2, count]) => {
      if (currentSelection.includes(n1)) synergyBoosts[n2] = (synergyBoosts[n2] || 0) + count;
      if (currentSelection.includes(n2)) synergyBoosts[n1] = (synergyBoosts[n1] || 0) + count;
    });
  }

  for (let i = 1; i <= max; i++) {
    if (excluded.has(i)) continue;
    const freq = stats.frequencies[i] || Math.floor((maxFreq + minFreq) / 2);
    const boost = synergyBoosts[i] || 0;
    const rangeIncentive = getRangeIncentive(i, currentSelection, max);
    
    let weight = 1;
    if (strategy === 'Chaud') {
      weight = Math.pow(Math.max(1, (freq - minFreq) / (maxFreq - minFreq || 1) * 10), 2) + boost * 5;
    } else if (strategy === 'Froid') {
      weight = Math.pow(Math.max(1, (maxFreq - freq) / (maxFreq - minFreq || 1) * 10), 2);
    } else if (strategy === 'Expert (Bonus)') {
      // Stratégie Experte : Mixte équilibré avec fort accent sur l'étalement (Range Incentive)
      weight = 15 + boost;
    } else if (strategy === 'Mixte') {
      // Stratégie Mixte : Base équilibrée + Influence des tendances (Analyse Prédictive)
      weight = 10 + boost;
      const trend = stats.trends.find(t => t.number === i);
      if (trend) {
        if (trend.direction === 'up') {
          // Augmentation proportionnelle à la force du changement
          weight *= (1 + trend.change * 0.15);
        } else if (trend.direction === 'down') {
          // Diminution sans jamais atteindre zéro
          weight *= Math.max(0.2, (1 - trend.change * 0.15));
        }
      }
    } else {
      weight = 10 + boost; 
    }

    const finalWeight = Math.max(1, Math.floor(weight * rangeIncentive));
    for (let j = 0; j < finalWeight; j++) weightedPool.push(i);
  }

  if (weightedPool.length === 0) {
    let num;
    do { num = Math.floor(Math.random() * max) + 1; } while (excluded.has(num));
    return num;
  }
  
  return weightedPool[Math.floor(Math.random() * weightedPool.length)];
};

export const generateGrids = (
  config: GameConfig, 
  dates: string[], 
  count: number = 5, 
  bonusCount: number = 0,
  stats: GameStats | null = null,
  gameType?: GameType
): Grid[] => {
  const grids: Grid[] = [];
  const dateNumbers = extractNumbersFromDates(dates);
  const baseStrategies: StrategyType[] = ['Mixte', 'Chaud', 'Froid'];
  const isLoto = gameType === GameType.LOTO;

  // 1. Grilles Standard (influencées par les dates)
  for (let i = 0; i < count; i++) {
    const mainNumbers = new Set<number>();
    const bonusNumbers = new Set<number>();
    const strategy = baseStrategies[i % baseStrategies.length];

    const shuffledPool = [...dateNumbers].sort(() => Math.random() - 0.5);
    for (const n of shuffledPool) {
      if (mainNumbers.size < config.mainCount && n >= 1 && n <= config.mainMax && Math.random() > 0.8) {
        mainNumbers.add(n);
      }
    }

    while (mainNumbers.size < config.mainCount) {
      mainNumbers.add(getWeightedRandom(config.mainMax, mainNumbers, stats, strategy, Array.from(mainNumbers)));
    }

    if (config.bonusCount > 0) {
      while (bonusNumbers.size < config.bonusCount) {
        bonusNumbers.add(getWeightedRandom(config.bonusMax, bonusNumbers, stats, 'Mixte'));
      }
    }

    grids.push({
      main: Array.from(mainNumbers).sort((a, b) => a - b),
      bonus: Array.from(bonusNumbers).sort((a, b) => a - b),
      strategy,
      joker: isLoto ? generateJoker() : undefined
    });
  }

  // 2. Grilles Bonus Expertes (Purement Data-Driven, ignorent les dates pour éviter le biais des petits numéros)
  for (let i = 0; i < bonusCount; i++) {
    const mainNumbers = new Set<number>();
    const bonusNumbers = new Set<number>();
    
    while (mainNumbers.size < config.mainCount) {
      mainNumbers.add(getWeightedRandom(config.mainMax, mainNumbers, stats, 'Expert (Bonus)', Array.from(mainNumbers)));
    }

    if (config.bonusCount > 0) {
      while (bonusNumbers.size < config.bonusCount) {
        bonusNumbers.add(getWeightedRandom(config.bonusMax, bonusNumbers, stats, 'Expert (Bonus)'));
      }
    }

    grids.push({
      main: Array.from(mainNumbers).sort((a, b) => a - b),
      bonus: Array.from(bonusNumbers).sort((a, b) => a - b),
      strategy: 'Expert (Bonus)',
      joker: isLoto ? generateJoker() : undefined
    });
  }

  return grids;
};
