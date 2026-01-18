
import { GameConfig, Grid, GameStats } from '../types';

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

/**
 * Sélectionne un nombre en fonction de son poids statistique
 */
const getWeightedRandom = (max: number, excluded: Set<number>, stats: GameStats | null, min: number = 1): number => {
  if (!stats) {
    let num;
    do { num = Math.floor(Math.random() * (max - min + 1)) + min; } while (excluded.has(num));
    return num;
  }

  // Création d'une liste pondérée : les numéros "chauds" apparaissent plus souvent dans le chapeau
  const weightedPool: number[] = [];
  for (let i = min; i <= max; i++) {
    if (excluded.has(i)) continue;
    const freq = stats.frequencies[i] || 1;
    // On ajoute le numéro N fois selon sa fréquence (pondération)
    const weight = Math.ceil(freq / 10); 
    for (let j = 0; j < weight; j++) weightedPool.push(i);
  }

  if (weightedPool.length === 0) return Math.floor(Math.random() * max) + 1;
  return weightedPool[Math.floor(Math.random() * weightedPool.length)];
};

export const generateGrids = (config: GameConfig, dates: string[], count: number = 5, stats: GameStats | null = null): Grid[] => {
  const grids: Grid[] = [];
  const dateNumbers = extractNumbersFromDates(dates);

  for (let i = 0; i < count; i++) {
    const mainNumbers = new Set<number>();
    const bonusNumbers = new Set<number>();
    
    const isWideSpectrum = i === 3;
    const minThreshold = isWideSpectrum ? Math.floor(config.mainMax * 0.6) : 1;

    // 1. Priorité aux dates (50% de chance d'utiliser un numéro de date s'il est dispo)
    const shuffledPool = [...dateNumbers].sort(() => Math.random() - 0.5);
    for (const n of shuffledPool) {
      let finalN = isWideSpectrum ? (n % (config.mainMax - minThreshold + 1)) + minThreshold : n;
      if (mainNumbers.size < config.mainCount && finalN >= 1 && finalN <= config.mainMax && Math.random() > 0.5) {
        mainNumbers.add(finalN);
      }
    }

    // 2. Compléter avec le poids statistique
    while (mainNumbers.size < config.mainCount) {
      mainNumbers.add(getWeightedRandom(config.mainMax, mainNumbers, stats, minThreshold));
    }

    // 3. Bonus
    if (config.bonusCount > 0) {
      while (bonusNumbers.size < config.bonusCount) {
        bonusNumbers.add(getWeightedRandom(config.bonusMax, bonusNumbers, null));
      }
    }

    grids.push({
      main: Array.from(mainNumbers).sort((a, b) => a - b),
      bonus: Array.from(bonusNumbers).sort((a, b) => a - b)
    });
  }

  return grids;
};
