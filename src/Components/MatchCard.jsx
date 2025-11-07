import React, { useState } from "react";
import "./MatchCard.css";

/**
 * MatchCard Component
 * Displays individual match info, score input (for admin), and winner highlight.
 */
const MatchCard = ({ match, teamsMap, onScoreSubmit, isAdmin }) => {
  // Initialize scores safely
  const [scoreA, setScoreA] = useState(match.scoreA ?? "");
  const [scoreB, setScoreB] = useState(match.scoreB ?? "");

  const teamA = teamsMap[match.teamA_id];
  const teamB = teamsMap[match.teamB_id];
  const winnerName = match.winner_id ? teamsMap[match.winner_id]?.name : "TBD";

  const isCompleted = match.winner_id !== null && match.winner_id !== undefined;

  const handleSubmit = (e) => {
    e.preventDefault();

    const sA = parseInt(scoreA);
    const sB = parseInt(scoreB);

    if (isNaN(sA) || isNaN(sB)) {
      alert("Please enter valid scores for both teams.");
      return;
    }
    if (sA === sB) {
      alert("No draws allowed — please enter a winning score.");
      return;
    }

    if (!match.teamA_id || !match.teamB_id) {
      alert("Teams for this match are not yet finalized.");
      return;
    }

    const winnerId = sA > sB ? match.teamA_id : match.teamB_id;
    onScoreSubmit(match.id, sA, sB, winnerId);
  };

  const timeDisplay = match.startTime ? ` [${match.startTime}]` : "";

  return (
    <div className={`match-card ${isCompleted ? "completed" : ""}`}>
      <h4 className="match-header">
        {match.round} – Match #{match.match_num}
        {timeDisplay}
      </h4>

      <div className="match-content">
        {/* --- Team A --- */}
        <div
          className={`team-name ${
            match.winner_id === match.teamA_id ? "winner" : ""
          }`}
        >
          {teamA ? teamA.name : "TBD"}
        </div>

        {/* --- Score Display / Admin Input --- */}
        {isAdmin && !isCompleted && teamA && teamB ? (
          <form onSubmit={handleSubmit} className="admin-score-form">
            <input
              type="number"
              min="0"
              value={scoreA}
              onChange={(e) => setScoreA(e.target.value)}
              required
            />
            <span className="dash">-</span>
            <input
              type="number"
              min="0"
              value={scoreB}
              onChange={(e) => setScoreB(e.target.value)}
              required
            />
            <button type="submit">Set</button>
          </form>
        ) : (
          <div className="score-display">
            {match.scoreA !== null && match.scoreA !== undefined
              ? `${match.scoreA} - ${match.scoreB}`
              : "vs"}
          </div>
        )}

        {/* --- Team B --- */}
        <div
          className={`team-name ${
            match.winner_id === match.teamB_id ? "winner" : ""
          }`}
        >
          {teamB ? teamB.name : "TBD"}
        </div>
      </div>

      {/* --- Winner Banner --- */}
      {isCompleted && (
        <div className="winner-banner">🏆 Winner: {winnerName}</div>
      )}
    </div>
  );
};

export default MatchCard;
