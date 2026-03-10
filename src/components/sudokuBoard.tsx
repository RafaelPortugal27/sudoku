import { useState, useEffect, useCallback, type JSX } from "react";
import './sudokuBoard.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type Grid = number[][];

interface Cell {
  value: number;
  given: boolean;
  notes: number[];
  error: boolean;
}

type Board = Cell[][];
type Position = [row: number, col: number] | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initBoard(initialBoard: Grid): Board {
  return initialBoard.map((row) =>
    row.map((val) => ({
      value: val,
      given: val !== 0,
      notes: [] as number[],
      error: false,
    }))
  );
}

function formatTime(seconds: number): string {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
type SudokuBoardProps = {
  initialBoard: Grid;
  solutionBoard: Grid;
};

export default function SudokuBoard({ initialBoard, solutionBoard }: SudokuBoardProps): JSX.Element {
  const [board, setBoard] = useState<Board>(initBoard(initialBoard));
  const [selected, setSelected] = useState<Position>(null);
  const [notesMode, setNotesMode] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(true);

  // ── Timer ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!running || completed) return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running, completed]);

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
      return sv !== 0 && board[r][c].value === sv;
    },
    [selected, board]
  );

  // ── Input handler ──────────────────────────────────────────────────────────

  const handleInput = useCallback(
    (num: number): void => {
      if (!selected) return;
      const [r, c] = selected;
      if (board[r][c].given) return;

      const newBoard: Board = board.map((row) =>
        row.map((cell) => ({ ...cell, notes: [...cell.notes] }))
      );

      if (notesMode && num !== 0) {
        const notes = newBoard[r][c].notes;
        newBoard[r][c].notes = notes.includes(num)
          ? notes.filter((n) => n !== num)
          : [...notes, num].sort((a, b) => a - b);
        newBoard[r][c].value = 0;
      } else {
        newBoard[r][c].value = num;
        newBoard[r][c].notes = [];
        if (num !== 0) {
          const correct = solutionBoard[r][c] === num;
          newBoard[r][c].error = !correct;
          if (!correct) setMistakes((m) => m + 1);
        } else {
          newBoard[r][c].error = false;
        }
      }

      setBoard(newBoard);

      const done = newBoard.every((row, ri) =>
        row.every((cell, ci) => cell.value === solutionBoard[ri][ci])
      );
      if (done) {
        setCompleted(true);
        setRunning(false);
      }
    },
    [selected, board, notesMode]
  );

  // ── Keyboard navigation ────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9) handleInput(n);
      if (e.key === "Backspace" || e.key === "Delete") handleInput(0);
      if (selected) {
        const [r, c] = selected;
        if (e.key === "ArrowUp")    setSelected([Math.max(0, r - 1), c]);
        if (e.key === "ArrowDown")  setSelected([Math.min(8, r + 1), c]);
        if (e.key === "ArrowLeft")  setSelected([r, Math.max(0, c - 1)]);
        if (e.key === "ArrowRight") setSelected([r, Math.min(8, c + 1)]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleInput, selected]);

  // ── Reset ──────────────────────────────────────────────────────────────────

  const resetGame = (): void => {
    setBoard(initBoard(initialBoard));
    setSelected(null);
    setCompleted(false);
    setMistakes(0);
    setTime(0);
    setRunning(true);
    setNotesMode(false);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="sudoku-box"
      style={{
        minHeight: "100vh",
        background: "#0f0f13",
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
      <div className="stats-row">
        <div className="stat">
          <span className="stat-val">{formatTime(time)}</span>
          Tempo
        </div>
        <div className="stat">
          <span
            className="stat-val"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
          >
            {[0, 1, 2].map((i) => (
              <span key={i} className="mistakes-dot" style={{ opacity: i < mistakes ? 1 : 0.15 }} />
            ))}
            {mistakes > 3 && (
              <span style={{ fontFamily: "DM Mono", fontSize: "0.9rem", color: "#e87a7a" }}>
                {mistakes}
              </span>
            )}
          </span>
          Erros
        </div>
        <button className="mode-btn" onClick={resetGame} style={{ marginLeft: 8 }}>
          ↺ Novo Jogo
        </button>
      </div>

      {/* ── Board ── */}
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
              if (sel)                           cls += " selected";
              else if (sv)                       cls += " same-value";
              else if (hl)                       cls += " highlighted";
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

      {/* ── Win overlay ── */}
      {completed && (
        <div className="win-overlay">
          <div className="win-card">
            <div className="win-title">Parabéns!</div>
            <div className="win-sub">Sudoku Completado</div>
            <div className="win-stats">
              <div className="stat">
                <span className="stat-val">{formatTime(time)}</span>
                Tempo Final
              </div>
              <div className="stat">
                <span
                  className="stat-val"
                  style={{ color: mistakes === 0 ? "#7ae87a" : "#e87a7a" }}
                >
                  {mistakes}
                </span>
                Erros
              </div>
            </div>
            <button className="new-game-btn" onClick={resetGame}>
              Jogar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
