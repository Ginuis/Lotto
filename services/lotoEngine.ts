
import { GameConfig, Grid, GameStats, StrategyType, GameType, AlgorithmWeights } from '../types';

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

const getRangeIncentive = (num: number, currentSelection: number[], max: number): number => {
  const decadeSize = 10;
  const decade = Math.floor((num - 1) / decadeSize);
  const alreadyInDecade = currentSelection.filter(n => Math.floor((n - 1) / decadeSize) === decade).length;
  // Pénalité progressive si trop de numéros dans la même dizaine
  return alreadyInDecade >= 2 ? 0.2 : 1.5;
};

const getWeightedRandom = (
  max: number, 
  excluded: Set<number>, 
  stats: GameStats | null, 
  weights: AlgorithmWeights,
  currentSelection: number[] = []
): number => {
  if (!stats) {
    let num;
    do { num = Math.floor(Math.random() * max) + 1; } while (excluded.has(num));
    return num;
  }

  const weightedPool: number[] = [];
  const freqEntries = Object.entries(stats.frequencies).map(([n, f]) => ({ n: parseInt(n), f }));
  const minFreq = Math.min(...freqEntries.map(e => e.f));
  const maxFreq = Math.max(...freqEntries.map(e => e.f));

  // Calcul des synergies (paires)
  const synergyBoosts: Record<number, number> = {};
  stats.frequentPairs.forEach(([n1, n2, count]) => {
    if (currentSelection.includes(n1)) synergyBoosts[n2] = (synergyBoosts[n2] || 0) + count;
    if (currentSelection.includes(n2)) synergyBoosts[n1] = (synergyBoosts[n1] || 0) + count;
  });

  for (let i = 1; i <= max; i++) {
    if (excluded.has(i)) continue;
    
    const freq = stats.frequencies[i] || (maxFreq + minFreq) / 2;
    const boost = synergyBoosts[i] || 0;
    const rangeIncentive = getRangeIncentive(i, currentSelection, max);
    const trend = stats.trends.find(t => t.number === i);

    // Score "Chaud" (0 à 10)
    const hotScore = ((freq - minFreq) / (maxFreq - minFreq || 1)) * 10;
    // Score "Froid" (0 à 10)
    const coldScore = ((maxFreq - freq) / (maxFreq - minFreq || 1)) * 10;
    // Score "Tendance" (-5 à 5)
    let trendScore = 0;
    if (trend) {
      if (trend.direction === 'up') trendScore = trend.change;
      if (trend.direction === 'down') trendScore = -trend.change;
    }

    // Fusion pondérée des influences
    let finalWeight = 10; // Base neutre
    finalWeight += (hotScore * weights.hot);
    finalWeight += (coldScore * weights.cold);
    finalWeight += (trendScore * weights.trend * 2);
    finalWeight += (boost * weights.synergy * 0.5);

    // Application de la diversité des plages (indispensable pour la régularité)
    finalWeight = Math.max(0.5, finalWeight * rangeIncentive);

    for (let j = 0; j < Math.ceil(finalWeight); j++) weightedPool.push(i);
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
  gameType?: GameType,
  kenoNumCount: number = 10,
  userWeights?: AlgorithmWeights
): Grid[] => {
  const grids: Grid[] = [];
  const dateNumbers = extractNumbersFromDates(dates);
  const isLotoVariant = gameType === GameType.LOTO || gameType === GameType.SUPER_LOTO;
  const isKeno = gameType === GameType.KENO;
  const targetMainCount = isKeno ? kenoNumCount : config.mainCount;

  // Profils par défaut si non spécifiés
  const defaultWeights: Record<string, AlgorithmWeights> = {
    'Mixte': { hot: 0.5, cold: 0.5, trend: 0.5, synergy: 0.5 },
    'Chaud': { hot: 1.0, cold: 0.1, trend: 0.3, synergy: 0.6 },
    'Froid': { hot: 0.1, cold: 1.0, trend: 0.1, synergy: 0.2 },
    'Expert (Bonus)': { hot: 0.6, cold: 0.4, trend: 0.8, synergy: 1.0 }
  };

  const baseStrategies: StrategyType[] = ['Mixte', 'Chaud', 'Froid'];

  // Génération des grilles standard
  for (let i = 0; i < count; i++) {
    const strategyName = baseStrategies[i % baseStrategies.length];
    const weights = userWeights || defaultWeights[strategyName];
    
    const mainNumbers = new Set<number>();
    const bonusNumbers = new Set<number>();

    // Injection des numéros de dates (influence chance personnelle)
    const shuffledDates = [...dateNumbers].sort(() => Math.random() - 0.5);
    for (const n of shuffledDates) {
      if (mainNumbers.size < Math.floor(targetMainCount / 2) && n >= 1 && n <= config.mainMax) {
        mainNumbers.add(n);
      }
    }

    while (mainNumbers.size < targetMainCount) {
      mainNumbers.add(getWeightedRandom(config.mainMax, mainNumbers, stats, weights, Array.from(mainNumbers)));
    }

    if (config.bonusCount > 0) {
      while (bonusNumbers.size < config.bonusCount) {
        bonusNumbers.add(getWeightedRandom(config.bonusMax, bonusNumbers, stats, weights));
      }
    }

    grids.push({
      main: Array.from(mainNumbers).sort((a, b) => a - b),
      bonus: Array.from(bonusNumbers).sort((a, b) => a - b),
      strategy: userWeights ? 'Custom' : strategyName,
      joker: isLotoVariant ? generateJoker() : undefined
    });
  }

  // Génération des grilles bonus expertes
  for (let i = 0; i < bonusCount; i++) {
    const weights = defaultWeights['Expert (Bonus)'];
    const mainNumbers = new Set<number>();
    const bonusNumbers = new Set<number>();
    
    while (mainNumbers.size < targetMainCount) {
      mainNumbers.add(getWeightedRandom(config.mainMax, mainNumbers, stats, weights, Array.from(mainNumbers)));
    }

    if (config.bonusCount > 0) {
      while (bonusNumbers.size < config.bonusCount) {
        bonusNumbers.add(getWeightedRandom(config.bonusMax, bonusNumbers, stats, weights));
      }
    }

    grids.push({
      main: Array.from(mainNumbers).sort((a, b) => a - b),
      bonus: Array.from(bonusNumbers).sort((a, b) => a - b),
      strategy: 'Expert (Bonus)',
      joker: isLotoVariant ? generateJoker() : undefined
    });
  }

  return grids;
};
