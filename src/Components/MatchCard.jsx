// src/components/MatchCard.jsx
import React, { useState } from "react";
import "./matchcard.css";

const MatchCard = ({ match, teamsMap = {}, onAdminSubmit, isAdmin=false }) => {
  const [a, setA] = useState(match.scoreA ?? "");
  const [b, setB] = useState(match.scoreB ?? "");
  const teamA = match.teamA_id ? teamsMap[match.teamA_id] : null;
  const teamB = match.teamB_id ? teamsMap[match.teamB_id] : null;
  const completed = match.scoreA !== null && match.scoreB !== null;

  const submit = (e) => {
    e.preventDefault();
    const sA = Number(a);
    const sB = Number(b);
    if (!Number.isFinite(sA) || !Number.isFinite(sB)) return alert("Enter valid scores");
    // In knockout we might forbid draws; for group stage draws allowed. Backend uses points: win=2 draw=1
    onAdminSubmit(match.id, sA, sB);
  };

  return (
    <div className={`match-card ${completed ? "done": ""}`}>
      <div className="match-head">{match.group || match.round || "GRP"} - #{match.match_num}</div>
      <div className="match-body">
        <div className={`team ${match.winner_id === match.teamA_id ? "winner" : ""}`}>
          {teamA ? teamA.name : "TBD"}
        </div>

        {isAdmin && !completed && teamA && teamB ? (
          <form className="score-form" onSubmit={submit}>
            <input type="number" min="0" value={a} onChange={(e)=>setA(e.target.value)} />
            <span> - </span>
            <input type="number" min="0" value={b} onChange={(e)=>setB(e.target.value)} />
            <button type="submit">Save</button>
          </form>
        ) : (
          <div className="score-display">
            {match.scoreA != null ? `${match.scoreA} - ${match.scoreB}` : "vs"}
          </div>
        )}

        <div className={`team ${match.winner_id === match.teamB_id ? "winner" : ""}`}>
          {teamB ? teamB.name : "TBD"}
        </div>
      </div>

      {completed && match.winner_id && (
        <div className="match-winner">Winner: {teamsMap[match.winner_id]?.name ?? "TBD"}</div>
      )}
    </div>
  );
};

export default MatchCard;
