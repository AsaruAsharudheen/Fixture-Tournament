import React, { useMemo, useState, useEffect } from "react";
import { useTournamentData } from "../hooks/useTournamentData";
import TeamInput from "../Components/TeamInput";
import MatchCard from "../Components/MatchCard";
import "./admin.css";

const generateId = () => Math.random().toString(36).substring(2, 9);
const initialData = { teams: [], matches: [] };
const LOGIN_API_URL = "https://fixture-tournament-backend.onrender.com/api/auth/login";

const BRACKET_MAP = [
  ["R1", 1, 1], ["R1", 2, 1],
  ["R1", 3, 2], ["R1", 4, 2],
  ["R1", 5, 3], ["R1", 6, 3],
  ["R1", 7, 4], ["R1", 8, 4],
  ["QF", 1, 1], ["QF", 2, 1],
  ["QF", 3, 2], ["QF", 4, 2],
  ["SF", 1, 1], ["SF", 2, 1],
];

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

const generateInitialMatches = (teams) => {
  const matches = [];

  // Round of 16
  for (let i = 0; i < 8; i++) {
    matches.push({
      id: generateId(),
      round: "R1",
      match_num: i + 1,
      teamA_id: teams[i * 2]?.id || null,
      teamB_id: teams[i * 2 + 1]?.id || null,
      scoreA: null,
      scoreB: null,
      winner_id: null,
    });
  }

  // QF, SF, F, T3
  for (let i = 0; i < 4; i++) matches.push({ id: generateId(), round: "QF", match_num: i + 1, teamA_id: null, teamB_id: null });
  for (let i = 0; i < 2; i++) matches.push({ id: generateId(), round: "SF", match_num: i + 1, teamA_id: null, teamB_id: null });
  matches.push({ id: generateId(), round: "F", match_num: 1, teamA_id: null, teamB_id: null });
  matches.push({ id: generateId(), round: "T3", match_num: 1, teamA_id: null, teamB_id: null });

  return matches;
};

const Admin = () => {
  const [tournamentData, setTournamentData, isLoading] = useTournamentData();
  const { teams, matches } = tournamentData;
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [localTeamNames, setLocalTeamNames] = useState(Array(16).fill(""));

  // ✅ Prevent unnecessary reloading after login
  const [isInitLoaded, setIsInitLoaded] = useState(false);
  useEffect(() => {
    if (!isLoading) setTimeout(() => setIsInitLoaded(true), 300);
  }, [isLoading]);

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
      } else setError(data.message || "Login failed");
    } catch {
      setError("Connection error.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const teamsMap = useMemo(
    () => teams.reduce((acc, team) => ({ ...acc, [team.id]: team }), {}),
    [teams]
  );

  const handleTeamsSubmit = (teamNames) => {
    const names = teamNames.filter((n) => n.trim() !== "");
    if (names.length !== 16) {
      setError("Please enter exactly 16 teams.");
      return;
    }
    const newTeams = names.map((name) => ({ id: generateId(), name }));
    const newMatches = generateInitialMatches(newTeams);
    setTournamentData({ teams: newTeams, matches: newMatches });
  };

  const handleScoreUpdate = (matchId, scoreA, scoreB, winnerId) => {
    setTournamentData((prevData) => {
      let updatedMatches = prevData.matches.map((m) =>
        m.id === matchId ? { ...m, scoreA, scoreB, winner_id: winnerId } : m
      );

      const currentMatch = prevData.matches.find((m) => m.id === matchId);
      const nextMatchInfo = getNextMatchInfo(currentMatch.round, currentMatch.match_num);
      if (nextMatchInfo) {
        const idx = updatedMatches.findIndex(
          (m) => m.round === nextMatchInfo.round && m.match_num === nextMatchInfo.match_num
        );
        if (idx !== -1)
          updatedMatches[idx] = { ...updatedMatches[idx], [nextMatchInfo.slot]: winnerId };
      }

      // SF loser -> T3
      if (currentMatch.round === "SF") {
        const loserId = winnerId === currentMatch.teamA_id ? currentMatch.teamB_id : currentMatch.teamA_id;
        const thirdIndex = updatedMatches.findIndex((m) => m.round === "T3");
        if (thirdIndex !== -1) {
          const slot = currentMatch.match_num === 1 ? "teamA_id" : "teamB_id";
          updatedMatches[thirdIndex] = { ...updatedMatches[thirdIndex], [slot]: loserId };
        }
      }

      return { ...prevData, matches: updatedMatches };
    });

    setMessage("✅ Match result saved!");
    setTimeout(() => setMessage(""), 2000);
  };

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <h1>🔐 Admin Login</h1>
        <form onSubmit={handleLogin} className="login-form">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          {error && <p className="login-error">{error}</p>}
          <button type="submit">Log In</button>
        </form>
      </div>
    );
  }

  // --- LOADING FIX ---
  if (!isInitLoaded) {
    return <div className="admin-container loading">Loading tournament data...</div>;
  }

  // --- TEAM INPUT VIEW ---
  if (!teams.length) {
    return (
      <div className="admin-container setup-view">
        <h1>Admin Panel: Tournament Setup</h1>
        <TeamInput onSubmit={handleTeamsSubmit} />
        {error && <p className="login-error">{error}</p>}
        <button className="logout-button" onClick={handleLogout}>Log Out</button>
      </div>
    );
  }

  const rounds = ["R1", "QF", "SF", "T3", "F"];
  return (
    <div className="admin-container manager-view">
      <h1>Admin Panel: Score Management</h1>
      <div className="admin-controls">
        <button onClick={() => window.confirm("Reset all data?") && setTournamentData(initialData)} className="reset-button">
          Reset Tournament Data
        </button>
        <button className="logout-button" onClick={handleLogout}>Log Out</button>
      </div>

      {message && <p className="success-msg">{message}</p>}
      {error && <p className="login-error">Server Error: {error}</p>}

      {rounds.map((round) => (
        <div key={round} className="round-section">
          <h2>
            {round === "R1" ? "Round of 16" :
             round === "QF" ? "Quarter Finals" :
             round === "SF" ? "Semi Finals" :
             round === "T3" ? "3rd Place Match" : "Grand Final"}
          </h2>
          <div className="match-grid">
            {matches.filter((m) => m.round === round).map((match) => (
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
