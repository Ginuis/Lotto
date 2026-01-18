
import { GameConfig, Grid, GameStats, GameType } from '../types';

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

const getWeightedRandom = (max: number, excluded: Set<number>, stats: GameStats | null, min: number = 1): number => {
  const available: number[] = [];
  for (let i = min; i <= max; i++) {
    if (!excluded.has(i)) available.push(i);
  }
  if (available.length === 0) return Math.floor(Math.random() * max) + 1;
  if (!stats) return available[Math.floor(Math.random() * available.length)];

  const weights = available.map(n => {
    const f = stats.frequencies[n] || 25;
    return Math.pow(f, 1.8);
  });
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let randomValue = Math.random() * totalWeight;
  for (let i = 0; i < available.length; i++) {
    randomValue -= weights[i];
    if (randomValue <= 0) return available[i];
  }
  return available[available.length - 1];
};

export const generateGrids = (
  config: GameConfig, 
  dates: string[], 
  count: number = 5, 
  stats: GameStats | null = null,
  isCrescendoPlus: boolean = false
): Grid[] => {
  const grids: Grid[] = [];
  const dateNumbers = extractNumbersFromDates(dates);

  for (let i = 0; i < count; i++) {
    const mainNumbers = new Set<number>();
    const bonusNumbers = new Set<number>();
    
    const isStatOnly = i === 2;
    const isWideSpectrum = i === 3;
    const isPureRandom = i === 4;
    // Ajustement dynamique du seuil de spectre large pour les plages courtes (ex: 25)
    const minThreshold = isWideSpectrum ? Math.floor(config.mainMax * 0.5) : 1;

    if (!isStatOnly && !isPureRandom) {
      const shuffledDates = [...dateNumbers].sort(() => Math.random() - 0.5);
      for (const n of shuffledDates) {
        let candidate = n;
        if (isWideSpectrum) {
          candidate = (n % (config.mainMax - minThreshold + 1)) + minThreshold;
        }
        if (mainNumbers.size < config.mainCount && candidate >= 1 && candidate <= config.mainMax) {
          if (Math.random() < 0.7) mainNumbers.add(candidate);
        }
      }
    }

    if (isStatOnly && stats && stats.hotNumbers) {
      const hotSelection = [...stats.hotNumbers]
        .filter(n => n <= config.mainMax)
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(config.mainCount * 0.6));
      hotSelection.forEach(n => mainNumbers.add(n));
    }

    while (mainNumbers.size < config.mainCount) {
      const useStats = !isPureRandom;
      mainNumbers.add(getWeightedRandom(config.mainMax, mainNumbers, useStats ? stats : null, minThreshold));
    }

    if (config.bonusCount > 0) {
      while (bonusNumbers.size < config.bonusCount) {
        bonusNumbers.add(getWeightedRandom(config.bonusMax, bonusNumbers, null));
      }
    }

    let multiplier = undefined;
    if (isCrescendoPlus) {
      multiplier = Math.floor(Math.random() * 9) + 2; // Multiplicateur de 2 à 10
    }

    grids.push({
      main: Array.from(mainNumbers).sort((a, b) => a - b),
      bonus: Array.from(bonusNumbers).sort((a, b) => a - b),
      multiplier
    });
  }

  return grids;
};
