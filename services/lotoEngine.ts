
import { GameConfig, Grid, GameStats } from '../types';

/**
 * Extrait des nombres d'une liste de dates pour influencer le tirage
 */
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
 * Sélection pondérée basée sur les fréquences statistiques (Algorithme de la roulette)
 */
const getWeightedRandom = (max: number, excluded: Set<number>, stats: GameStats | null, min: number = 1): number => {
  const available: number[] = [];
  for (let i = min; i <= max; i++) {
    if (!excluded.has(i)) available.push(i);
  }

  if (available.length === 0) return Math.floor(Math.random() * max) + 1;

  if (!stats) {
    return available[Math.floor(Math.random() * available.length)];
  }

  // Calcul des poids : on amplifie les fréquences pour favoriser les numéros "chauds"
  // Utilisation d'une puissance pour accentuer la différence entre numéros fréquents et rares
  const weights = available.map(n => {
    const f = stats.frequencies[n] || 25; // Fréquence par défaut si inconnue
    return Math.pow(f, 1.8); // Accentuation de l'attrait des numéros "Hot"
  });

  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let randomValue = Math.random() * totalWeight;

  for (let i = 0; i < available.length; i++) {
    randomValue -= weights[i];
    if (randomValue <= 0) return available[i];
  }

  return available[available.length - 1];
};

/**
 * Génère un ensemble de grilles avec des stratégies variées
 */
export const generateGrids = (config: GameConfig, dates: string[], count: number = 5, stats: GameStats | null = null): Grid[] => {
  const grids: Grid[] = [];
  const dateNumbers = extractNumbersFromDates(dates);

  for (let i = 0; i < count; i++) {
    const mainNumbers = new Set<number>();
    const bonusNumbers = new Set<number>();
    
    // Stratégie spécifique par grille
    // Grille 1-2: Hybride (Dates + Stats)
    // Grille 3: Purement Statistique (Hot Numbers)
    // Grille 4: Spectre Large (Tranche Haute + Stats)
    // Grille 5: Aléatoire Pur (Contrôle du chaos)
    
    const isStatOnly = i === 2;
    const isWideSpectrum = i === 3;
    const isPureRandom = i === 4;
    const minThreshold = isWideSpectrum ? Math.floor(config.mainMax * 0.6) : 1;

    // 1. PHASE : NUMÉROS DE DATES (Sauf pour stat-only ou pure-random)
    if (!isStatOnly && !isPureRandom) {
      const shuffledDates = [...dateNumbers].sort(() => Math.random() - 0.5);
      for (const n of shuffledDates) {
        let candidate = n;
        if (isWideSpectrum) {
          // Scaling pour spectre large
          candidate = (n % (config.mainMax - minThreshold + 1)) + minThreshold;
        }

        if (mainNumbers.size < config.mainCount && candidate >= 1 && candidate <= config.mainMax) {
          // On ajoute avec une probabilité de 70% pour laisser de la place aux stats
          if (Math.random() < 0.7) mainNumbers.add(candidate);
        }
      }
    }

    // 2. PHASE : HOT NUMBERS (Priorité directe pour la grille statistique)
    if (isStatOnly && stats && stats.hotNumbers) {
      const hotSelection = [...stats.hotNumbers]
        .filter(n => n <= config.mainMax)
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(config.mainCount * 0.6));
      
      hotSelection.forEach(n => mainNumbers.add(n));
    }

    // 3. PHASE : COMPLÉTION PONDÉRÉE
    while (mainNumbers.size < config.mainCount) {
      const useStats = !isPureRandom;
      mainNumbers.add(getWeightedRandom(config.mainMax, mainNumbers, useStats ? stats : null, minThreshold));
    }

    // 4. PHASE : NUMÉROS BONUS
    if (config.bonusCount > 0) {
      // Pour les bonus, on utilise aussi les statistiques si disponibles (si l'objet stats contient des bonus, ici simplifié)
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
