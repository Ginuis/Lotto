
import { GameType, GameStats, StatTrend } from '../types';
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

  // Generate mock pairs
  const frequentPairs: [number, number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const n1 = sortedNums[i];
    const n2 = sortedNums[Math.floor(Math.random() * 10) + 5];
    if (n1 && n2 && n1 !== n2) {
      frequentPairs.push([Math.min(n1, n2), Math.max(n1, n2), Math.floor(Math.random() * 15) + 5]);
    }
  }

  // Generate mock triplets
  const frequentTriplets: [number, number, number, number][] = [];
  for (let i = 0; i < 3; i++) {
    const n1 = sortedNums[i];
    const n2 = sortedNums[i + 1];
    const n3 = sortedNums[Math.floor(Math.random() * 10) + 10];
    if (n1 && n2 && n3) {
      frequentTriplets.push([n1, n2, n3, Math.floor(Math.random() * 8) + 2]);
    }
  }

  // Generate mock trends
  const trends: StatTrend[] = sortedNums.slice(0, 15).map(n => ({
    number: n,
    direction: Math.random() > 0.6 ? 'up' : Math.random() > 0.4 ? 'stable' : 'down',
    change: Math.floor(Math.random() * 5) + 1
  }));

  return {
    hotNumbers: sortedNums.slice(0, Math.min(10, Math.floor(maxNum / 2))),
    coldNumbers: sortedNums.slice(-Math.min(10, Math.floor(maxNum / 2))).reverse(),
    frequencies,
    frequentPairs,
    frequentTriplets,
    trends
  };
};
