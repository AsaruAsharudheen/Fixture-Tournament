// src/components/MatchCard.jsx
import React, { useState } from 'react';
import './MatchCard.css';

const MatchCard = ({ match, teamsMap, onScoreSubmit, isAdmin }) => {
  // Use match scores for initial state, handle potential null/undefined
  const [scoreA, setScoreA] = useState(match.scoreA ?? '');
  const [scoreB, setScoreB] = useState(match.scoreB ?? '');

  const teamA = teamsMap[match.teamA_id];
  const teamB = teamsMap[match.teamB_id];
  const winnerName = match.winner_id ? teamsMap[match.winner_id]?.name : 'TBD';

  const isCompleted = match.winner_id !== null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const sA = parseInt(scoreA);
    const sB = parseInt(scoreB);

    if (isNaN(sA) || isNaN(sB) || sA === sB) {
      alert('Please enter valid, non-tied scores.');
      return;
    }
    
    // Determine the winner ID
    const winnerId = sA > sB ? match.teamA_id : match.teamB_id;
    
    // Check if teams are actually defined (prevents scoring BYE/TBD matches)
    if (!match.teamA_id || !match.teamB_id) {
        alert('Teams for this match are not yet finalized.');
        return;
    }

    onScoreSubmit(match.id, sA, sB, winnerId);
  };
  
  // Logic to display calculated start time
  const timeDisplay = match.startTime ? ` [${match.startTime}]` : '';

  return (
    <div className={`match-card ${isCompleted ? 'completed' : ''}`}>
      <h4 className="match-header">{match.round} Match #{match.match_num}{timeDisplay}</h4>
      
      <div className="match-content">
        {/* Team A */}
        <div className={`team-name ${match.winner_id === match.teamA_id ? 'winner' : ''}`}>
          {teamA ? teamA.name : 'TBD'}
        </div>
        
        {isAdmin && !isCompleted && match.teamA_id && match.teamB_id ? (
          <form onSubmit={handleSubmit} className="admin-score-form">
            <input type="number" value={scoreA} onChange={(e) => setScoreA(e.target.value)} required />
            <span>-</span>
            <input type="number" value={scoreB} onChange={(e) => setScoreB(e.target.value)} required />
            <button type="submit">Set</button>
          </form>
        ) : (
          <div className="score-display">
            {match.scoreA !== null ? `${match.scoreA} - ${match.scoreB}` : 'vs'}
          </div>
        )}
        
        {/* Team B */}
        <div className={`team-name ${match.winner_id === match.teamB_id ? 'winner' : ''}`}>
          {teamB ? teamB.name : 'TBD'}
        </div>
      </div>
      
      {isCompleted && (
        <div className="winner-banner">
          Winner: {winnerName}
        </div>
      )}
    </div>
  );
};

export default MatchCard;