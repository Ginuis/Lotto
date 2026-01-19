
import { GameConfig, Grid, GameStats, StrategyType } from '../types';

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

  // Enhancement: Synergy Boost (Pairs/Triplets)
  const synergyBoosts: Record<number, number> = {};
  if (strategy === 'Chaud' || strategy === 'Mixte') {
    stats.frequentPairs.forEach(([n1, n2, count]) => {
      if (currentSelection.includes(n1)) synergyBoosts[n2] = (synergyBoosts[n2] || 0) + count;
      if (currentSelection.includes(n2)) synergyBoosts[n1] = (synergyBoosts[n1] || 0) + count;
    });
    stats.frequentTriplets.forEach(([n1, n2, n3, count]) => {
      const intersect = currentSelection.filter(x => [n1, n2, n3].includes(x));
      if (intersect.length === 2) {
        const remaining = [n1, n2, n3].find(x => !currentSelection.includes(x));
        if (remaining) synergyBoosts[remaining] = (synergyBoosts[remaining] || 0) + count * 2;
      }
    });
  }

  for (let i = 1; i <= max; i++) {
    if (excluded.has(i)) continue;
    const freq = stats.frequencies[i] || Math.floor((maxFreq + minFreq) / 2);
    const boost = synergyBoosts[i] || 0;
    
    let weight = 1;
    if (strategy === 'Chaud') {
      weight = Math.pow(Math.max(1, (freq - minFreq) / (maxFreq - minFreq || 1) * 10), 2);
      weight += boost * 5; // Add synergy boost to hot strategy
    } else if (strategy === 'Froid') {
      weight = Math.pow(Math.max(1, (maxFreq - freq) / (maxFreq - minFreq || 1) * 10), 2);
      // Froid strategy ignores hot synergy boosts to favor isolated low-frequency numbers
    } else {
      weight = 10 + boost; 
    }

    const finalWeight = Math.max(1, Math.floor(weight));
    for (let j = 0; j < finalWeight; j++) weightedPool.push(i);
  }

  if (weightedPool.length === 0) {
    let num;
    do { num = Math.floor(Math.random() * max) + 1; } while (excluded.has(num));
    return num;
  }
  
  return weightedPool[Math.floor(Math.random() * weightedPool.length)];
};

export const generateGrids = (config: GameConfig, dates: string[], count: number = 5, stats: GameStats | null = null): Grid[] => {
  const grids: Grid[] = [];
  const dateNumbers = extractNumbersFromDates(dates);
  const strategies: StrategyType[] = ['Mixte', 'Chaud', 'Froid'];

  for (let i = 0; i < count; i++) {
    const mainNumbers = new Set<number>();
    const bonusNumbers = new Set<number>();
    const strategy = strategies[i % strategies.length];

    const shuffledPool = [...dateNumbers].sort(() => Math.random() - 0.5);
    for (const n of shuffledPool) {
      if (mainNumbers.size < config.mainCount && n >= 1 && n <= config.mainMax && Math.random() > 0.75) {
        mainNumbers.add(n);
      }
    }

    while (mainNumbers.size < config.mainCount) {
      const nextNum = getWeightedRandom(config.mainMax, mainNumbers, stats, strategy, Array.from(mainNumbers));
      mainNumbers.add(nextNum);
    }

    if (config.bonusCount > 0) {
      while (bonusNumbers.size < config.bonusCount) {
        bonusNumbers.add(getWeightedRandom(config.bonusMax, bonusNumbers, stats, 'Mixte'));
      }
    }

    grids.push({
      main: Array.from(mainNumbers).sort((a, b) => a - b),
      bonus: Array.from(bonusNumbers).sort((a, b) => a - b),
      strategy
    });
  }

  return grids;
};
