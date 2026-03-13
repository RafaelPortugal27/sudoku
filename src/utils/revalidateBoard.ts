import type { Board } from "./types";

/**
 * Returns true if placing `num` at (row, col) conflicts with any
 * existing value in the same row, column, or 3×3 box.
 */
function hasDuplicate(board: Board, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    // Same row (skip self)
    if (i !== col && board[row][i].value === num) return true;
    // Same column (skip self)
    if (i !== row && board[i][col].value === num) return true;
  }
  // Same 3×3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c].value === num) return true;
    }
  }
  return false;
}


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