export type Grid = number[][];

export interface Cell {
  value: number;
  given: boolean;
  notes: number[];
  error: boolean;
}

export type Board = Cell[][];
export type Position = [row: number, col: number] | null;