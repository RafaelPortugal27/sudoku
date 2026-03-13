import { useState, useEffect, useCallback, type JSX } from "react";
import type { Grid, Board, Position } from "../../utils/types";
import initBoard from "../../utils/initBoard";
import revalidateBoard from "../../utils/revalidateBoard";
import formatTime from "../../utils/formatTime";
import hasDuplicate from "../../utils/hasDuplicate";
import PUZZLE_LIBRARY from "../../utils/PUZZLE_LIBRARY";
import WinOverlay from "../winOverlay";
import StatsBar from "../statsBar";
import PuzzleSelectorModal from "../PuzzleSelectorModal";
import './sudokuBoard.css';

// ─── Component ────────────────────────────────────────────────────────────────
type SudokuBoardProps = {
  initialBoard?: Grid;
};

export default function SudokuBoard({ initialBoard }: SudokuBoardProps): JSX.Element {
  const firstPuzzle = initialBoard ?? PUZZLE_LIBRARY[0].grid;
  const [currentPuzzle, setCurrentPuzzle] = useState<Grid>(firstPuzzle);

  const [board, setBoard] = useState<Board>(initBoard(firstPuzzle));
  const [selected, setSelected] = useState<Position>(null);
  const [notesMode, setNotesMode] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(true);
  const [paused, setPaused] = useState<boolean>(false);

  const [showSelector, setShowSelector] = useState<boolean>(false);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!running || completed || paused) return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running, completed, paused]);

  // ── Start puzzle ───────────────────────────────────────────────────────────
  const startPuzzle = useCallback((grid: Grid) => {
    setCurrentPuzzle(grid);
    setBoard(initBoard(grid));
    setSelected(null);
    setCompleted(false);
    setMistakes(0);
    setTime(0);
    setRunning(true);
    setPaused(false);
    setNotesMode(false);
    setShowSelector(false);
  }, []);

  // ── Auto-fill notes ────────────────────────────────────────────────────────
  const autoFillNotes = useCallback(() => {
    if (paused || completed) return;
    setBoard((prev) =>
      prev.map((row, r) =>
        row.map((cell, c) => {
          if (cell.value !== 0) return cell;
          const possible: number[] = [];
          for (let n = 1; n <= 9; n++) {
            if (!hasDuplicate(prev, r, c, n)) possible.push(n);
          }
          return { ...cell, notes: possible };
        })
      )
    );
  }, [paused, completed]);

  // ── Play / Pause ───────────────────────────────────────────────────────────
  const togglePause = (): void => {
    setPaused((p) => !p);
    setSelected(null);
  };

  // ── Cell state helpers ─────────────────────────────────────────────────────
  const isSelected = (r: number, c: number): boolean =>
    selected !== null && selected[0] === r && selected[1] === c;

  const getHighlighted = useCallback(
    (r: number, c: number): boolean => {
      if (!selected) return false;
      const [sr, sc] = selected;
      const sameBox =
        Math.floor(r / 3) === Math.floor(sr / 3) &&
        Math.floor(c / 3) === Math.floor(sc / 3);
      return r === sr || c === sc || sameBox;
    },
    [selected]
  );

  const getSameValue = useCallback(
    (r: number, c: number): boolean => {
      if (!selected) return false;
      const [sr, sc] = selected;
      const sv = board[sr][sc].value;
      return sv !== 0 && (board[r][c].value === sv || board[r][c].notes.includes(sv));
    },
    [selected, board]
  );

  // ── Input handler ──────────────────────────────────────────────────────────
  const handleInput = useCallback(
    (num: number): void => {
      if (!selected || paused) return;
      const [r, c] = selected;
      if (board[r][c].given) return;

      let newBoard: Board = board.map((row) =>
        row.map((cell) => ({ ...cell, notes: [...cell.notes] }))
      );

      if (notesMode && num !== 0) {
        const notes = newBoard[r][c].notes;
        newBoard[r][c].notes = notes.includes(num)
          ? notes.filter((n) => n !== num)
          : [...notes, num].sort((a, b) => a - b);
        newBoard[r][c].value = 0;
        newBoard[r][c].error = false;
      } else {
        newBoard[r][c].value = num;
        newBoard[r][c].notes = [];
        // Re-validate entire board so removing a conflict clears sibling errors
        newBoard = revalidateBoard(newBoard);
        if (num !== 0 && newBoard[r][c].error) {
          setMistakes((m) => m + 1);
        }
      }

      setBoard(newBoard);

      // Win: all cells filled, no errors
      const done = newBoard.every((row) =>
        row.every((cell) => cell.value !== 0 && !cell.error)
      );
      if (done) {
        setCompleted(true);
        setRunning(false);
      }
    },
    [selected, board, notesMode, paused]
  );

  // ── Keyboard navigation ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (paused || showSelector) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9) handleInput(n);
      if (e.key === "Backspace" || e.key === "Delete") handleInput(0);
      if (selected) {
        const [r, c] = selected;
        if (e.key === "ArrowUp") setSelected([Math.max(0, r - 1), c]);
        if (e.key === "ArrowDown") setSelected([Math.min(8, r + 1), c]);
        if (e.key === "ArrowLeft") setSelected([r, Math.max(0, c - 1)]);
        if (e.key === "ArrowRight") setSelected([r, Math.min(8, c + 1)]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleInput, selected, paused, showSelector]);

  // ── Reset (replay current puzzle) ─────────────────────────────────────────
  const resetGame = (): void => {
    startPuzzle(currentPuzzle);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="sudoku-box"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia', serif",
        padding: "20px",
      }}
    >
      <div className="sudoku-title">Sudoku</div>
      <div className="sudoku-sub">Classic 9 × 9</div>

      {/* ── Stats bar ── */}
      <StatsBar 
        formatedTime={formatTime(time)}
        mistakes={mistakes}
        paused={paused}
        onClickPause={togglePause}
        onResetGame={resetGame}
        onClickPuzzles={() => setShowSelector(true)}
      />

      {/* ── Board or Pause screen ── */}
      {paused ? (
        <div className="pause-screen">
          <div className="pause-icon">⏸</div>
          <div className="pause-label">Jogo Pausado</div>
          <div className="pause-time">{formatTime(time)}</div>
          <button className="new-game-btn" onClick={togglePause}>
            ▶ Continuar
          </button>
        </div>
      ) : (
        <>
          <div className="board-wrap">
            {board.map((row, r) => (
              <div className="board-row" key={r}>
                {row.map((cell, c) => {
                  const boxR = c === 2 || c === 5;
                  const boxB = r === 2 || r === 5;
                  const sel = isSelected(r, c);
                  const hl  = getHighlighted(r, c);
                  const sv  = getSameValue(r, c);

                  let cls = "cell";
                  if (sel)  cls += " selected";
                  else if (sv) cls += " same-value";
                  else if (hl) cls += " highlighted";
                  if (cell.error && cell.value !== 0) cls += " error-cell";
                  if (boxR) cls += " box-right";
                  if (boxB) cls += " box-bottom";

                  return (
                    <div key={c} className={cls} onClick={() => setSelected([r, c])}>
                      {cell.value !== 0 ? (
                        <span
                          className={`cell-value ${
                            cell.given ? "given" : cell.error ? "error" : "user"
                          }`}
                        >
                          {cell.value}
                        </span>
                      ) : cell.notes.length > 0 ? (
                        <div className="notes-grid">
                          {([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((n) => (
                            <div className="note-num" key={n}>
                              {cell.notes.includes(n) ? n : ""}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* ── Controls ── */}
          <div className="controls">
            <div className="mode-row">
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className={`mode-btn ${!notesMode ? "active" : ""}`}
                  onClick={() => setNotesMode(false)}
                >
                  ✏ Normal
                </button>
                <button
                  className={`mode-btn ${notesMode ? "active" : ""}`}
                  onClick={() => setNotesMode(true)}
                >
                  ✦ Notas
                </button>
              </div>
              <span
                style={{
                  fontFamily: "DM Mono",
                  fontSize: "0.7rem",
                  color: notesMode ? "#7a9e7a" : "#555",
                  letterSpacing: "0.1em",
                }}
              >
                {notesMode ? "MODO NOTAS ATIVO" : "MODO NORMAL"}
              </span>
            </div>

            {/* ── Auto-fill notes button ── */}
            <button className="auto-notes-btn" onClick={autoFillNotes}>
              ◈ Preencher Notas Possíveis
            </button>

            <div className="numpad">
              {([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((n) => (
                <button key={n} className="num-btn" onClick={() => handleInput(n)}>
                  {n}
                </button>
              ))}
            </div>

            <button className="erase-btn" onClick={() => handleInput(0)}>
              ✕ Apagar
            </button>
          </div>
        </>
      )}

      {/* ── Win overlay ── */}
      {completed && (
        <WinOverlay
          formatedFinalTime={formatTime(time)}
          mistakes={mistakes}
          onResetGame={resetGame}
          onClickPuzzles={() => { setCompleted(false); setShowSelector(true); }} 
        />
      )}


      {/* ── Puzzle Selector Modal ── */}
      {showSelector && (
        <PuzzleSelectorModal
          onHideSelector={() => setShowSelector(false)}
          onStartPuzzle={startPuzzle}
        />
      )}
    </div>
  );
}
