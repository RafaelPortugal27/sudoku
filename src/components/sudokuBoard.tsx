import React, { useState } from "react";
import "./sudokuBoard.css";

type CellValue = number | "";

const createEmptyBoard = (): CellValue[][] =>
  Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => "")
  );

const sudokuBoard: React.FC = () => {
  const [board, setBoard] = useState<CellValue[][]>(createEmptyBoard);

  const handleChange = (
    row: number,
    col: number,
    value: string
  ) => {
    if (!/^[1-9]?$/.test(value)) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = value === "" ? "" : Number(value);
    setBoard(newBoard);
  };

  return (
    <div className="sudoku-container">
      <div className="sudoku-grid">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isBlockBorderRight = (colIndex + 1) % 3 === 0 && colIndex !== 8;
            const isBlockBorderBottom = (rowIndex + 1) % 3 === 0 && rowIndex !== 8;

            return (
              <input
                key={`${rowIndex}-${colIndex}`}
                className={`sudoku-cell 
                  ${isBlockBorderRight ? "border-right" : ""}
                  ${isBlockBorderBottom ? "border-bottom" : ""}
                `}
                type="text"
                maxLength={1}
                value={cell}
                onChange={(e) =>
                  handleChange(rowIndex, colIndex, e.target.value)
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default sudokuBoard;