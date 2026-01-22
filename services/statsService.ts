
import { GameType, GameStats, StatTrend, WinningDraw } from '../types';
import { GAME_CONFIGS } from '../constants';

export const fetchGameStats = async (game: GameType): Promise<GameStats> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const config = GAME_CONFIGS[game];
  const maxNum = config.mainMax;
  const frequencies: Record<number, number> = {};
  
  for (let i = 1; i <= maxNum; i++) {
    frequencies[i] = Math.floor(Math.random() * 100) + 20;
  }

  const sortedNums = Object.keys(frequencies)
    .map(Number)
    .sort((a, b) => frequencies[b] - frequencies[a]);

  // Génération d'un historique réaliste (10 derniers tirages)
  const history: WinningDraw[] = [];
  for (let i = 0; i < 10; i++) {
    const drawNums: number[] = [];
    while (drawNums.length < config.mainCount) {
      const n = Math.floor(Math.random() * maxNum) + 1;
      if (!drawNums.includes(n)) drawNums.push(n);
    }
    const bonusNums: number[] = [];
    if (config.bonusCount > 0) {
      while (bonusNums.length < config.bonusCount) {
        const n = Math.floor(Math.random() * config.bonusMax) + 1;
        if (!bonusNums.includes(n)) bonusNums.push(n);
      }
    }
    
    const d = new Date();
    d.setDate(d.getDate() - (i * 3)); // Tirages tous les 3 jours environ

    history.push({
      date: d.toLocaleDateString('fr-FR'),
      numbers: drawNums.sort((a, b) => a - b),
      bonus: bonusNums.sort((a, b) => a - b),
      joker: game === GameType.LOTO ? Math.floor(1000000 + Math.random() * 9000000).toString() : undefined
    });
  }

  // Mock pairs/triplets (existing logic)
  const frequentPairs: [number, number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const n1 = sortedNums[i];
    const n2 = sortedNums[Math.floor(Math.random() * 10) + 5];
    if (n1 && n2 && n1 !== n2) frequentPairs.push([Math.min(n1, n2), Math.max(n1, n2), Math.floor(Math.random() * 15) + 5]);
  }

  const frequentTriplets: [number, number, number, number][] = [];
  for (let i = 0; i < 3; i++) {
    const n1 = sortedNums[i];
    const n2 = sortedNums[i + 1];
    const n3 = sortedNums[Math.floor(Math.random() * 10) + 10];
    if (n1 && n2 && n3) frequentTriplets.push([n1, n2, n3, Math.floor(Math.random() * 8) + 2]);
  }

  const trends: StatTrend[] = sortedNums.slice(0, 15).map(n => ({
    number: n,
    direction: Math.random() > 0.6 ? 'up' : Math.random() > 0.4 ? 'stable' : 'down',
    change: Math.floor(Math.random() * 5) + 1
  }));

  return {
    hotNumbers: sortedNums.slice(0, 10),
    coldNumbers: sortedNums.slice(-10).reverse(),
    frequencies,
    frequentPairs,
    frequentTriplets,
    trends,
    history
  };
};
