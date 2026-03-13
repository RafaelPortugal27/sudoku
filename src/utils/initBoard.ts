import type { Board, Grid } from "./types";

export default function initBoard(initialBoard: Grid): Board {
  return initialBoard.map((row) =>
    row.map((val) => ({
      value: val,
      given: val !== 0,
      notes: [] as number[],
      error: false,
    }))
  );
}