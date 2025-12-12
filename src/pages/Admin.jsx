// src/views/Admin.jsx
import React, { useMemo, useState } from "react";
import TeamInput from "../Components/TeamInput";
import MatchCard from "../Components/MatchCard";
import GroupStandings from "../Components/GroupStandings";
import {
  generateGroups,
  updateMatch,
  generateSemifinals,
  generateFinal,
  login,
} from "../api/tournamentApi";
import { useTournamentData } from "../hooks/useTournamentData";
import "./Admin.css";

export default function Admin() {

  // LOGIN STATE
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const token = localStorage.getItem("token");

  // TOURNAMENT STATE
  const { data, setData, load } = useTournamentData();
  const allTeams = [...data.groups.A, ...data.groups.B];

  const teamsMap = useMemo(
    () => allTeams.reduce((a, t) => ((a[t.id] = t), a), {}),
    [allTeams]
  );

  // LOGIN HANDLER
  const doLogin = async (e) => {
    e.preventDefault();
    const res = await login(username, password);

    if (!res.ok) {
      setLoginError(res.body?.message || "Login Failed");
      return;
    }

    localStorage.setItem("token", res.body.token);
    window.location.reload();
  };

  // CREATE GROUPS (8 TEAMS)
  const createGroups = async (teams) => {
    const res = await generateGroups(teams, token);
    if (!res.ok) return alert(res.body.message);
    setData(res.body.tournament);
  };

  // UPDATE MATCH (scores, penalties, toss)
  const saveScore = async (payload) => {
    const res = await updateMatch(payload, token);

    if (!res.ok) return alert(res.body.message);

    if (res.body.tournament) setData(res.body.tournament);
    else load();
  };

  // GENERATE SEMIS
  const makeSemis = async () => {
    const res = await generateSemifinals(token);
    if (!res.ok) return alert(res.body.message);
    setData(res.body.tournament);
  };

  // GENERATE FINAL
  const makeFinal = async () => {
    const res = await generateFinal(token);
    if (!res.ok) return alert(res.body.message);
    setData(res.body.tournament);
  };

  // LOGIN PAGE
  if (!token) {
    return (
      <div className="fixture-bg">
        <div className="fixture-content admin-wrapper">

          <h1 className="title">Admin Login</h1>

          <form className="login-box" onSubmit={doLogin}>
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUser(e.target.value)}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPass(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>

          {loginError && <p className="err">{loginError}</p>}
        </div>
      </div>
    );
  }

  // TEAM INPUT PAGE (8 teams)
  if (!allTeams.length) {
    return (
      <div className="fixture-bg">
        <div className="fixture-content admin-wrapper">

          <h2 className="title">Add 8 Teams</h2>

          <TeamInput onSubmit={createGroups} />

          <button
            className="secondary"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
          >
            Logout
          </button>

        </div>
      </div>
    );
  }

  // MAIN ADMIN DASHBOARD
  return (
    <div className="fixture-bg">
      <div className="fixture-content admin-wrapper">

        <h1 className="title">Admin Panel</h1>

        <div className="admin-controls">
          <button onClick={load}>Refresh</button>
          <button onClick={makeSemis}>Generate Semifinals</button>
          <button onClick={makeFinal}>Generate Final</button>

          <button
            className="secondary"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
          >
            Logout
          </button>
        </div>

        {/* GROUP TABLES */}
        <div className="group-row">
          <GroupStandings title="Group A" teams={data.groups.A} />
          <GroupStandings title="Group B" teams={data.groups.B} />
        </div>

        {/* MATCHES */}
        <h2 className="section-title">Matches</h2>
        <div className="match-grid">
          {data.matches.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              teamsMap={teamsMap}
              isAdmin
              onScoreSubmit={saveScore}
            />
          ))}
        </div>

        {/* SEMIS */}
        <h2 className="section-title">Semifinals</h2>
        <div className="match-grid">
          {data.matches
            .filter((m) => m.group === "SEMIS")
            .map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                teamsMap={teamsMap}
                isAdmin
                onScoreSubmit={saveScore}
              />
            ))}
        </div>

        {/* FINAL */}
        <h2 className="section-title">Final</h2>
        <div className="match-grid">
          {data.matches
            .filter((m) => m.group === "FINAL")
            .map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                teamsMap={teamsMap}
                isAdmin
                onScoreSubmit={saveScore}
              />
            ))}
        </div>

      </div>
    </div>
  );
}
