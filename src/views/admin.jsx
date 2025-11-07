// src/views/Admin.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useTournamentData } from '../hooks/useTournamentData';
import TeamInput from '../Components/TeamInput';
import MatchCard from '../Components/MatchCard';
import './admin.css';

// Helper function to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Data structure definition
const initialData = { teams: [], matches: [] };

// API Endpoint for Login (Updated to Render deployment)
const LOGIN_API_URL = 'https://fixture-tournament-backend.onrender.com/api/auth/login';

// Bracket structure: defines which match feeds into the next match
const BRACKET_MAP = [
  // [Round, MatchNumber, FeedsIntoMatchNumber]
  ['R1', 1, 1], ['R1', 2, 1],
  ['R1', 3, 2], ['R1', 4, 2],
  ['R1', 5, 3], ['R1', 6, 3],
  ['R1', 7, 4], ['R1', 8, 4],
  ['QF', 1, 1], ['QF', 2, 1],
  ['QF', 3, 2], ['QF', 4, 2],
  ['SF', 1, 1], ['SF', 2, 1],
];

// Helper to find the next match based on the current one
const getNextMatchInfo = (currentRound, currentMatchNum, currentTeamSlot) => {
    const mapEntry = BRACKET_MAP.find(
        ([round, matchNum, _]) => round === currentRound && matchNum === currentMatchNum
    );

    if (!mapEntry) return null;

    const [, , feedsIntoMatchNum] = mapEntry;

    let nextRound;
    if (currentRound === 'R1') nextRound = 'QF';
    else if (currentRound === 'QF') nextRound = 'SF';
    else if (currentRound === 'SF') nextRound = 'F';
    else return null;

    // Logic to determine if the winner goes to teamA_id or teamB_id slot in the next match
    const slot = (currentMatchNum % 2 !== 0) ? 'teamA_id' : 'teamB_id';

    return {
        round: nextRound,
        match_num: feedsIntoMatchNum,
        slot: slot,
    };
};

// Generates the initial 16 match bracket structure
const generateInitialMatches = teams => {
  const matches = [];

  // R1: Round of 16 (8 Matches)
  for (let i = 0; i < 8; i++) {
    matches.push({
      id: generateId(), round: 'R1', match_num: i + 1,
      teamA_id: teams[i * 2].id, teamB_id: teams[i * 2 + 1].id,
      scoreA: null, scoreB: null, winner_id: null,
    });
  }

  // QF, SF, F, T3 initialization (same as before)
  for (let i = 0; i < 4; i++) {
    matches.push({ id: generateId(), round: 'QF', match_num: i + 1, teamA_id: null, teamB_id: null, scoreA: null, scoreB: null, winner_id: null, });
  }
  for (let i = 0; i < 2; i++) {
    matches.push({ id: generateId(), round: 'SF', match_num: i + 1, teamA_id: null, teamB_id: null, scoreA: null, scoreB: null, winner_id: null, });
  }
  matches.push({ id: generateId(), round: 'F', match_num: 1, teamA_id: null, teamB_id: null, scoreA: null, scoreB: null, winner_id: null, });
  matches.push({ id: generateId(), round: 'T3', match_num: 1, teamA_id: null, teamB_id: null, scoreA: null, scoreB: null, winner_id: null, });

  return matches;
};

const Admin = () => {
  const [tournamentData, setTournamentData, isLoading] = useTournamentData();
  const { teams, matches } = tournamentData;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setIsLoggedIn(true);
    }
  }, []);

  // --- AUTHENTICATION LOGIC ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token); 
        setIsLoggedIn(true);
      } else {
        setError(data.message || 'Login failed. Check server logs.');
      }
    } catch (error) {
      setError('Connection error. Is the backend running?');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setError('');
  };


  const teamsMap = useMemo(
    () => teams.reduce((acc, team) => ({ ...acc, [team.id]: team }), {}),
    [teams]
  );

  // --- DATA SUBMISSION LOGIC ---
  const handleTeamsSubmit = teamNames => {
    const newTeams = teamNames.map(name => ({ id: generateId(), name }));
    const newMatches = generateInitialMatches(newTeams);
    setTournamentData({ teams: newTeams, matches: newMatches });
  };

  const handleScoreUpdate = (matchId, scoreA, scoreB, winnerId) => {
    setTournamentData(prevData => {
      let updatedMatches = prevData.matches.map(m =>
        m.id === matchId ? { ...m, scoreA, scoreB, winner_id: winnerId } : m
      );

      const currentMatch = prevData.matches.find(m => m.id === matchId);
      if (!currentMatch) return prevData;

      // --- 1. Advance WINNER (R1, QF, SF to F) ---
      const nextMatchInfo = getNextMatchInfo(
        currentMatch.round,
        currentMatch.match_num,
        currentMatch.match_num
      );

      if (nextMatchInfo) {
        const nextMatchIndex = updatedMatches.findIndex(
          m => m.round === nextMatchInfo.round && m.match_num === nextMatchInfo.match_num
        );

        if (nextMatchIndex !== -1) {
          updatedMatches[nextMatchIndex] = {
            ...updatedMatches[nextMatchIndex],
            [nextMatchInfo.slot]: winnerId,
            scoreA: updatedMatches[nextMatchIndex].scoreA, 
            scoreB: updatedMatches[nextMatchIndex].scoreB,
            winner_id: updatedMatches[nextMatchIndex].winner_id,
          };
        }
      }

      // --- 2. Advance LOSER (SF to T3) ---
      if (currentMatch.round === 'SF') {
        const loserId = winnerId === currentMatch.teamA_id ? currentMatch.teamB_id : currentMatch.teamA_id;
        
        const thirdPlaceIndex = updatedMatches.findIndex(m => m.round === 'T3');
        
        if (thirdPlaceIndex !== -1) {
          const slotToUpdate = currentMatch.match_num === 1 ? 'teamA_id' : 'teamB_id';

          updatedMatches[thirdPlaceIndex] = {
            ...updatedMatches[thirdPlaceIndex],
            [slotToUpdate]: loserId,
            scoreA: updatedMatches[thirdPlaceIndex].scoreA,
            scoreB: updatedMatches[thirdPlaceIndex].scoreB,
            winner_id: updatedMatches[thirdPlaceIndex].winner_id,
          };
        }
      }

      return { ...prevData, matches: updatedMatches };
    });
  };
    
  // --- LOGIN VIEW RENDER ---
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <h1>🔐 Admin Login</h1>
        <form onSubmit={handleLogin} className="login-form">
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => {setUsername(e.target.value); setError('');}}
            required 
            autoComplete="username"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => {setPassword(e.target.value); setError('');}}
            required 
            autoComplete="current-password"
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit">Log In</button>
        </form>
      </div>
    );
  }
  
  if (isLoading) {
    return <div className="admin-container loading">Loading tournament data...</div>;
  }

  // --- ADMIN PANEL RENDER ---
  if (!teams.length) {
    return (
      <div className="admin-container setup-view">
        <h1>Admin Panel: Tournament Setup</h1>
        <TeamInput onSubmit={handleTeamsSubmit} />
        <button className="logout-button" onClick={handleLogout}>Log Out</button>
      </div>
    );
  }

  const rounds = ['R1', 'QF', 'SF', 'T3', 'F']; 

  return (
    <div className="admin-container manager-view">
      <h1>Admin Panel: Score Management</h1>
      <div className="admin-controls">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to reset the entire tournament data? This action will save the reset to the server.'))
              setTournamentData(initialData); 
          }}
          className="reset-button"
        >
          Reset Tournament Data
        </button>
        <button className="logout-button" onClick={handleLogout}>Log Out</button>
        {error && <p className="login-error">Server Error: {error}</p>}
      </div>

      {rounds.map(round => (
        <div key={round} className="round-section">
          <h2>
            {round === 'R1' ? 'Round of 16'
              : round === 'QF' ? 'Quarter Finals'
              : round === 'SF' ? 'Semi Finals'
              : round === 'T3' ? '3rd Place Match' 
              : 'The GRAND FINAL'}
          </h2>
          <div className="match-grid">
            {matches
              .filter(m => m.round === round)
              .map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  teamsMap={teamsMap}
                  onScoreSubmit={handleScoreUpdate}
                  isAdmin={true}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Admin;