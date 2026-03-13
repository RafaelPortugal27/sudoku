import { useCallback, useState, type JSX } from 'react';
import { PUZZLE_LIBRARY } from "../../utils/PUZZLE_LIBRARY";
import type { Difficulty, Grid } from '../../utils/types';
import './PuzzleSelectorModal.css';

// ─── Mini Grid (puzzle thumbnail) ─────────────────────────────────────────────
function MiniGrid({ grid }: { grid: Grid }): JSX.Element {
  return (
    <div className="mini-grid">
      {grid.map((row, r) => (
        <div className="mini-row" key={r}>
          {row.map((val, c) => {
            let cls = "mini-cell";
            if (val !== 0) cls += " mini-given";
            if (c === 2 || c === 5) cls += " mini-box-r";
            if (r === 2 || r === 5) cls += " mini-box-b";
            return <div key={c} className={cls} />;
          })}
        </div>
      ))}
    </div>
  );
}

/* ── Puzzle Selector Modal ── */
type PuzzleSelectorModalProps = {
  onHideSelector: () => void;
  onStartPuzzle: (grid: Grid) => void;
}
export default function PuzzleSelectorModal({
  onHideSelector,
  onStartPuzzle,
}: PuzzleSelectorModalProps) {
  const [selectorTab, setSelectorTab] = useState<Difficulty | "Personalizado">("Fácil");
  const [customInput, setCustomInput] = useState<string[][]>(
    () => Array.from({ length: 9 }, () => Array(9).fill(""))
  );

  const startRandom = useCallback(() => {
    const idx = Math.floor(Math.random() * PUZZLE_LIBRARY.length);
    onStartPuzzle(PUZZLE_LIBRARY[idx].grid);
  }, [onStartPuzzle]);

  const startCustomPuzzle = useCallback(() => {
  const grid: Grid = customInput.map((row) =>
    row.map((v) => {
      const n = parseInt(v, 10);
      return isNaN(n) || n < 1 || n > 9 ? 0 : n;
    })
  );
  onStartPuzzle(grid);
}, [customInput, onStartPuzzle]);

  return (<div className="selector-overlay" onClick={onHideSelector}>
    <div className="selector-card" onClick={(e) => e.stopPropagation()}>

      <div className="selector-header">
        <div className="selector-title">Escolher Puzzle</div>
        <button className="selector-close" onClick={onHideSelector}>✕</button>
      </div>

      {/* Random button */}
      <button className="random-btn" onClick={startRandom}>
        ⚄ Puzzle Aleatório
      </button>

      {/* Difficulty tabs */}
      <div className="selector-tabs">
        {(["Fácil", "Médio", "Difícil", "Personalizado"] as const).map((tab) => (
          <button
            key={tab}
            className={`selector-tab ${selectorTab === tab ? "active" : ""} tab-${tab.toLowerCase().replace("é", "e").replace("í", "i")}`}
            onClick={() => setSelectorTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {selectorTab === "Personalizado" ? (
        <div className="custom-section">
          <p className="custom-hint">
            Digite os números dados (1-9). Deixe em branco as células vazias.
          </p>
          <div className="custom-grid">
            {customInput.map((row, r) =>
              row.map((val, c) => {
                let cls = "custom-cell";
                if (c === 2 || c === 5) cls += " ccbr";
                if (r === 2 || r === 5) cls += " ccbb";
                return (
                  <input
                    key={`${r}-${c}`}
                    className={cls}
                    value={val}
                    maxLength={1}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^1-9]/g, "").slice(-1);
                      setCustomInput((prev) => {
                        const next = prev.map((row) => [...row]);
                        next[r][c] = v;
                        return next;
                      });
                    }}
                  />
                );
              })
            )}
          </div>
          <div className="custom-actions">
            <button
              className="custom-clear-btn"
              onClick={() =>
                setCustomInput(Array.from({ length: 9 }, () => Array(9).fill("")))
              }
            >
              ✕ Limpar
            </button>
            <button className="new-game-btn" onClick={startCustomPuzzle}>
              Iniciar Puzzle
            </button>
          </div>
        </div>
      ) : (
        <div className="puzzle-list">
          {PUZZLE_LIBRARY.filter((p) => p.difficulty === selectorTab).map((puzzle, i) => (
            <button
              key={puzzle.id}
              className="puzzle-card"
              onClick={() => onStartPuzzle(puzzle.grid)}
            >
              <MiniGrid grid={puzzle.grid} />
              <span className="puzzle-label">Puzzle {i + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  </div>)
}