// src/views/Admin.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useTournamentData } from "../hooks/useTournamentData";
import TeamInput from "../components/TeamInput";
import MatchCard from "../components/MatchCard";
import "./admin.css";

// Helper function to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Initial empty data structure
const initialData = { teams: [], matches: [] };

// Backend Login API
const LOGIN_API_URL = "https://fixture-tournament-backend.onrender.com/api/auth/login";

// Bracket flow mapping
const BRACKET_MAP = [
  ["R1", 1, 1], ["R1", 2, 1],
  ["R1", 3, 2], ["R1", 4, 2],
  ["R1", 5, 3], ["R1", 6, 3],
  ["R1", 7, 4], ["R1", 8, 4],
  ["QF", 1, 1], ["QF", 2, 1],
  ["QF", 3, 2], ["QF", 4, 2],
  ["SF", 1, 1], ["SF", 2, 1],
];

// Determine where winner feeds into
const getNextMatchInfo = (currentRound, currentMatchNum) => {
  const entry = BRACKET_MAP.find(
    ([round, num]) => round === currentRound && num === currentMatchNum
  );
  if (!entry) return null;

  const [, , feedsIntoMatchNum] = entry;

  let nextRound;
  if (currentRound === "R1") nextRound = "QF";
  else if (currentRound === "QF") nextRound = "SF";
  else if (currentRound === "SF") nextRound = "F";
  else return null;

  const slot = currentMatchNum % 2 !== 0 ? "teamA_id" : "teamB_id";
  return { round: nextRound, match_num: feedsIntoMatchNum, slot };
};

// Generate the initial matches
const generateInitialMatches = (teams) => {
  const matches = [];

  // Round of 16
  for (let i = 0; i < 8; i++) {
    matches.push({
      id: generateId(),
      round: "R1",
      match_num: i + 1,
      teamA_id: teams[i * 2].id,
      teamB_id: teams[i * 2 + 1].id,
      scoreA: null,
      scoreB: null,
      winner_id: null,
    });
  }

  // QF, SF, F, and T3
  for (let i = 0; i < 4; i++) {
    matches.push({
      id: generateId(),
      round: "QF",
      match_num: i + 1,
      teamA_id: null,
      teamB_id: null,
      scoreA: null,
      scoreB: null,
      winner_id: null,
    });
  }

  for (let i = 0; i < 2; i++) {
    matches.push({
      id: generateId(),
      round: "SF",
      match_num: i + 1,
      teamA_id: null,
      teamB_id: null,
      scoreA: null,
      scoreB: null,
      winner_id: null,
    });
  }

  matches.push({
    id: generateId(),
    round: "F",
    match_num: 1,
    teamA_id: null,
    teamB_id: null,
    scoreA: null,
    scoreB: null,
    winner_id: null,
  });

  matches.push({
    id: generateId(),
    round: "T3",
    match_num: 1,
    teamA_id: null,
    teamB_id: null,
    scoreA: null,
    scoreB: null,
    winner_id: null,
  });

  return matches;
};

// --- MAIN ADMIN COMPONENT ---
const Admin = () => {
  const [tournamentData, setTournamentData, isLoading] = useTournamentData();
  const { teams, matches } = tournamentData;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setIsLoggedIn(true);
    }
  }, []);

  // --- LOGIN HANDLER ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
      } else {
        setError(data.message || "Login failed. Check credentials.");
      }
    } catch {
      setError("Connection error. Is the backend running?");
    }
  };

  // --- LOGOUT ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setError("");
  };

  // --- MAP TEAM IDS ---
  const teamsMap = useMemo(
    () => teams.reduce((acc, team) => ({ ...acc, [team.id]: team }), {}),
    [teams]
  );

  // --- TEAMS SETUP ---
  const handleTeamsSubmit = (teamNames) => {
    if (teamNames.length !== 16) {
      setError("Please enter exactly 16 teams.");
      return;
    }
    const newTeams = teamNames.map((name) => ({ id: generateId(), name }));
    const newMatches = generateInitialMatches(newTeams);
    setTournamentData({ teams: newTeams, matches: newMatches });
  };

  // --- SCORE UPDATE ---
  const handleScoreUpdate = (matchId, scoreA, scoreB, winnerId) => {
    setTournamentData((prevData) => {
      let updatedMatches = prevData.matches.map((m) =>
        m.id === matchId ? { ...m, scoreA, scoreB, winner_id: winnerId } : m
      );

      const currentMatch = prevData.matches.find((m) => m.id === matchId);
      if (!currentMatch) return prevData;

      // Advance Winner
      const nextMatchInfo = getNextMatchInfo(
        currentMatch.round,
        currentMatch.match_num
      );

      if (nextMatchInfo) {
        const idx = updatedMatches.findIndex(
          (m) =>
            m.round === nextMatchInfo.round &&
            m.match_num === nextMatchInfo.match_num
        );

        if (idx !== -1) {
          updatedMatches[idx] = {
            ...updatedMatches[idx],
            [nextMatchInfo.slot]: winnerId,
          };
        }
      }

      // Send SF losers to T3
      if (currentMatch.round === "SF") {
        const loserId =
          winnerId === currentMatch.teamA_id
            ? currentMatch.teamB_id
            : currentMatch.teamA_id;

        const thirdIndex = updatedMatches.findIndex((m) => m.round === "T3");
        if (thirdIndex !== -1) {
          const slot = currentMatch.match_num === 1 ? "teamA_id" : "teamB_id";
          updatedMatches[thirdIndex] = {
            ...updatedMatches[thirdIndex],
            [slot]: loserId,
          };
        }
      }

      return { ...prevData, matches: updatedMatches };
    });

    setMessage("✅ Match result saved!");
    setTimeout(() => setMessage(""), 2000);
  };

  // --- LOGIN VIEW ---
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <h1>🔐 Admin Login</h1>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            required
            autoComplete="current-password"
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit">Log In</button>
        </form>
      </div>
    );
  }

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="admin-container loading">
        Loading tournament data...
      </div>
    );
  }

  // --- TEAM SETUP VIEW ---
  if (!teams.length) {
    return (
      <div className="admin-container setup-view">
        <h1>Admin Panel: Tournament Setup</h1>
        <TeamInput onSubmit={handleTeamsSubmit} />
        {error && <p className="login-error">{error}</p>}
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    );
  }

  // --- SCORE MANAGEMENT VIEW ---
  const rounds = ["R1", "QF", "SF", "T3", "F"];

  return (
    <div className="admin-container manager-view">
      <h1>Admin Panel: Score Management</h1>
      <div className="admin-controls">
        <button
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to reset the entire tournament?"
              )
            ) {
              setTournamentData(initialData);
            }
          }}
          className="reset-button"
        >
          Reset Tournament Data
        </button>
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      {message && <p className="success-msg">{message}</p>}
      {error && <p className="login-error">Server Error: {error}</p>}

      {rounds.map((round) => (
        <div key={round} className="round-section">
          <h2>
            {round === "R1"
              ? "Round of 16"
              : round === "QF"
              ? "Quarter Finals"
              : round === "SF"
              ? "Semi Finals"
              : round === "T3"
              ? "3rd Place Match"
              : "Grand Final"}
          </h2>
          <div className="match-grid">
            {matches
              .filter((m) => m.round === round)
              .map((match) => (
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
