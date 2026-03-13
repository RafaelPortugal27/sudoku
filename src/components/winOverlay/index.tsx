import './winOverlay.css';

type winOverlayParams = {
  formatedFinalTime: string;
  mistakes: number;
  onResetGame: () => void;
  onClickPuzzles: () => void;
}

export default function winOverlay({ formatedFinalTime, mistakes, onResetGame, onClickPuzzles }: winOverlayParams) {
  return <div className="win-overlay">
    <div className="win-card">
      <div className="win-title">Parabéns!</div>
      <div className="win-sub">Sudoku Completado</div>
      <div className="win-stats">
        <div className="stat">
          <span className="stat-val">{formatedFinalTime}</span>
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
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button className="new-game-btn" onClick={onResetGame} style={{ background: "transparent", border: "1px solid #e8d5a3", color: "#e8d5a3" }}>
          ↺ Jogar Novamente
        </button>
        <button className="new-game-btn" onClick={onClickPuzzles}>
          ☰ Novo Puzzle
        </button>
      </div>
    </div>
  </div>
}