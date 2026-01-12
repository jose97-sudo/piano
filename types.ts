
export type Clef = 'treble' | 'bass';

export type NoteDuration = 'w' | 'h' | 'q'; // whole (redonda), half (blanca), quarter (negra)

export interface MusicNote {
  keys: string[];
  duration: NoteDuration;
}

export interface GeneratorConfig {
  clef: Clef;
  includeRedondas: boolean;
  includeBlancas: boolean;
  includeNegras: boolean;
  count: number;
}
