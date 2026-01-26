
export enum GameType {
  EUROMILLIONS = 'EuroMillions',
  EURODREAMS = 'EuroDreams',
  LOTO = 'Loto France',
  SUPER_LOTO = 'Super Loto',
  KENO = 'Keno FDJ',
  CRESCENDO = 'Crescendo'
}

export type StrategyType = 'Mixte' | 'Chaud' | 'Froid' | 'Expert (Bonus)' | 'Custom';

export interface AlgorithmWeights {
  hot: number;    // Influence des numéros fréquents
  cold: number;   // Influence des numéros rares (revanche)
  trend: number;  // Influence des dynamiques récentes (up/down)
  synergy: number; // Influence des paires et triplés fréquents
}

export interface WinningDraw {
  date: string;
  numbers: number[];
  bonus: number[];
  joker?: string;
}

export interface FinanceRecord {
  id: string;
  date: string;
  gameType: GameType;
  investment: number;
  winnings: number;
  notes?: string;
}

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
  joker?: string;
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
  frequentPairs: [number, number, number][];
  frequentTriplets: [number, number, number, number][];
  trends: StatTrend[];
  history: WinningDraw[];
}
