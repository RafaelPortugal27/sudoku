import './winOverlay.css';

type winOverlayParams = {
  formatedFinalTime: string;
  mistakes: number;
  onResetGame: () => void;
}

export default function winOverlay({ formatedFinalTime, mistakes, onResetGame }: winOverlayParams) {
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
      <button className="new-game-btn" onClick={onResetGame}>
        Jogar Novamente
      </button>
    </div>
  </div>
}