
import { GameType, GameStats } from '../types';

/**
 * Simule la récupération des statistiques FDJ.
 * En production, cela appellerait une API ou scraperait les fichiers CSV FDJ.
 */
export const fetchGameStats = async (game: GameType): Promise<GameStats> => {
  // Simulation de délai réseau
  await new Promise(resolve => setTimeout(resolve, 800));

  // Ajustement de la plage de numéros : 25 pour Crescendo, 50 par défaut pour les autres
  const maxNum = game === GameType.CRESCENDO ? 25 : 50;
  const frequencies: Record<number, number> = {};
  
  // Génération de fréquences aléatoires mais plausibles pour l'exemple
  for (let i = 1; i <= maxNum; i++) {
    frequencies[i] = Math.floor(Math.random() * 100) + 20;
  }

  const sortedNums = Object.keys(frequencies)
    .map(Number)
    .sort((a, b) => frequencies[b] - frequencies[a]);

  return {
    hotNumbers: sortedNums.slice(0, 10),
    coldNumbers: sortedNums.slice(-10).reverse(),
    frequencies
  };
};
