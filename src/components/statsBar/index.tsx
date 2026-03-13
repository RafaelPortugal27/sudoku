import './StatsBar.css';

type StatsBarProps = {
  formatedTime: string;
  mistakes: number;
  paused: boolean;
  onClickPause: () => void;
  onResetGame: () => void;
  onClickPuzzles: () => void;
}

export default function StatsBar({ formatedTime, mistakes, paused, onClickPause, onResetGame, onClickPuzzles }: StatsBarProps) {
  return (<div className="stats-row">
    <div className="stat">
      <span className="stat-val">{formatedTime}</span>
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

    {/* Play / Pause */}
    <button
      className={`mode-btn ${paused ? "active" : ""}`}
      onClick={onClickPause}
      title={paused ? "Continuar" : "Pausar"}
    >
      {paused ? "▶ Continuar" : "⏸ Pausar"}
    </button>

    <button className="mode-btn" onClick={onResetGame} style={{ marginLeft: 4 }}>
      ↺ Reiniciar
    </button>

    <button
      className="mode-btn"
      onClick={onClickPuzzles}
      style={{ borderColor: "#e8d5a3", color: "#e8d5a3" }}
    >
      ☰ Puzzles
    </button>
  </div>)
}