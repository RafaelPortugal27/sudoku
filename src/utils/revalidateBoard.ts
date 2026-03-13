import type { Board } from "./types";
import hasDuplicate from "./hasDuplicate";

/**
 * After mutating the board, re-evaluates errors for every non-given cell
 * so that fixing a conflict clears the error on previously-flagged cells too.
 */
export default function revalidateBoard(board: Board): Board {
  return board.map((row, r) =>
    row.map((cell, c) => {
      if (cell.given || cell.value === 0) return { ...cell, error: false };
      return { ...cell, error: hasDuplicate(board, r, c, cell.value) };
    })
  );
}