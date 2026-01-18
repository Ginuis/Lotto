
export enum GameType {
  EUROMILLIONS = 'EuroMillions',
  EURODREAMS = 'EuroDreams',
  LOTO = 'Loto France',
  CRESCENDO = 'Crescendo'
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
  multiplier?: number; // Optionnel, pour Crescendo+
}

export interface GameStats {
  hotNumbers: number[];
  coldNumbers: number[];
  frequencies: Record<number, number>;
}
