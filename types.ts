
export enum GameType {
  EUROMILLIONS = 'EuroMillions',
  EURODREAMS = 'EuroDreams',
  LOTO = 'Loto France',
  CRESCENDO = 'Crescendo'
}

export type StrategyType = 'Mixte' | 'Chaud' | 'Froid';

export interface GameConfig {
  mainCount: number;
  mainMax: number;
  bonusCount: number;
  bonusMax: number;
  bonusLabel: string;
  color: string;
  bonusColor: string;
  price: number;
}

export interface Grid {
  main: number[];
  bonus: number[];
  strategy: StrategyType;
}

export interface StatTrend {
  number: number;
  direction: 'up' | 'down' | 'stable';
  change: number;
}

export interface GameStats {
  hotNumbers: number[];
  coldNumbers: number[];
  frequencies: Record<number, number>;
  frequentPairs: [number, number, number][]; // [num1, num2, occurrences]
  frequentTriplets: [number, number, number, number][]; // [num1, num2, num3, occurrences]
  trends: StatTrend[];
}
