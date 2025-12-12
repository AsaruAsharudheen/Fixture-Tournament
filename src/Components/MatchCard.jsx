import React, { useState } from "react";
import "./MatchCard.css";

export default function MatchCard({ match, teamsMap, onScoreSubmit, isAdmin }) {
  const [scoreA, setScoreA] = useState(match.scoreA ?? "");
  const [scoreB, setScoreB] = useState(match.scoreB ?? "");
  const [penA, setPenA] = useState(match.penaltyA ?? "");
  const [penB, setPenB] = useState(match.penaltyB ?? "");

  const teamA = teamsMap[match.teamA_id];
  const teamB = teamsMap[match.teamB_id];

  const knockout = match.group === "SEMIS" || match.group === "FINAL";

  const numA = scoreA === "" ? null : Number(scoreA);
  const numB = scoreB === "" ? null : Number(scoreB);

  const isDraw = knockout && numA === numB && numA !== null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    const payload = {
      matchId: match.id,
      scoreA: numA,
      scoreB: numB,
    };

    if (isDraw) {
      payload.penaltyA = penA === "" ? null : Number(penA);
      payload.penaltyB = penB === "" ? null : Number(penB);
    }

    onScoreSubmit(payload);
  };

  return (
    <div className={`match-card ${match.winner_id ? "completed" : ""}`}>
      <h4 className="match-header">
        {teamA?.name} vs {teamB?.name}
        {match.startTime && <span>{match.startTime}</span>}
      </h4>

      <form onSubmit={handleSubmit} className="score-form">

        <div className="score-row">
          <input
            type="number"
            value={scoreA}
            min="0"
            onChange={(e) => setScoreA(e.target.value)}
            disabled={!isAdmin}
          />
          <span>-</span>
          <input
            type="number"
            value={scoreB}
            min="0"
            onChange={(e) => setScoreB(e.target.value)}
            disabled={!isAdmin}
          />
        </div>

        {isDraw && (
          <div className="penalty-row">
            <input
              type="number"
              placeholder="Pen A"
              value={penA}
              min="0"
              onChange={(e) => setPenA(e.target.value)}
            />
            <span>pen</span>
            <input
              type="number"
              placeholder="Pen B"
              value={penB}
              min="0"
              onChange={(e) => setPenB(e.target.value)}
            />
          </div>
        )}

        {isAdmin && <button type="submit">Save</button>}
      </form>

      {match.winner_id && (
        <div className="winner-banner">
          Winner: {teamsMap[match.winner_id]?.name}
          {match.tossWinner ? " (Toss Winner)" : ""}
        </div>
      )}
    </div>
  );
}
