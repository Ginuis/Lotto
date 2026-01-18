
import { GameType, GameConfig } from './types';

export const GAME_CONFIGS: Record<GameType, GameConfig> = {
  [GameType.EUROMILLIONS]: {
    mainCount: 5,
    mainMax: 50,
    bonusCount: 2,
    bonusMax: 12,
    bonusLabel: 'Étoiles',
    color: 'bg-blue-600',
    bonusColor: 'bg-yellow-400',
    price: 2.50
  },
  [GameType.EURODREAMS]: {
    mainCount: 6,
    mainMax: 40,
    bonusCount: 1,
    bonusMax: 5,
    bonusLabel: 'N° Dream',
    color: 'bg-indigo-600',
    bonusColor: 'bg-purple-400',
    price: 2.50
  },
  [GameType.LOTO]: {
    mainCount: 5,
    mainMax: 49,
    bonusCount: 1,
    bonusMax: 10,
    bonusLabel: 'N° Chance',
    color: 'bg-red-600',
    bonusColor: 'bg-orange-400',
    price: 2.20
  },
  [GameType.CRESCENDO]: {
    mainCount: 6,
    mainMax: 50,
    bonusCount: 0,
    bonusMax: 0,
    bonusLabel: '',
    color: 'bg-emerald-600',
    bonusColor: 'bg-emerald-400',
    price: 2.00
  }
};
