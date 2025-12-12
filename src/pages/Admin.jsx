// src/pages/Admin.jsx
import React, { useMemo, useState } from "react";
import TeamInput from "../Components/TeamInput";
import MatchCard from "../Components/MatchCard";
import GroupStandings from "../components/GroupStandings";
import { useTournamentData } from "../hooks/useTournamentData";
import { generateGroups, updateMatch, generateSemifinals, generateFinal } from "../api/tournamentApi";
// import "./admin.css";

const LOGIN_API = (process.env.REACT_APP_AUTH_BASE || "https://fixture-tournament-backend.onrender.com/api/auth") + "/login";

const Admin = () => {
  const { data, setData, load, loading, error, savingRef } = useTournamentData();
  const [msg, setMsg] = useState("");
  const [loginError, setLoginError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const token = localStorage.getItem("token");

  const teamsList = [...(data.groups?.A || []), ...(data.groups?.B || [])];
  const teamsMap = useMemo(() => {
    return teamsList.reduce((acc, t) => { acc[t.id] = t; return acc; }, {});
  }, [teamsList]);

  const handleGenerate = async (teams) => {
    if (!token) return alert("Please login first.");
    savingRef.current = true;
    const res = await generateGroups(teams, token);
    savingRef.current = false;
    if (!res.ok) return alert(res.body?.message || "Generate failed");
    setData(res.body.tournament || res.body);
    setMsg("Groups generated");
  };

  const handleScore = async (matchId, sA, sB) => {
    if (!token) return alert("Login required.");
    savingRef.current = true;
    const res = await updateMatch(matchId, sA, sB, token);
    savingRef.current = false;
    if (!res.ok) return alert(res.body?.message || "Update failed");
    setData(res.body.tournament || res.body);
    setMsg("Score updated");
    setTimeout(()=> setMsg(""), 2000);
  };

  const handleGenerateSemis = async () => {
    if (!token) return alert("Login required.");
    savingRef.current = true;
    const res = await generateSemifinals(token);
    savingRef.current = false;
    if (!res.ok) return alert(res.body?.message || "Generate semis failed");
    // backend returns semis & tournament
    setData(res.body.tournament || res.body);
    setMsg("Semifinals generated");
  };

  const handleGenerateFinal = async () => {
    if (!token) return alert("Login required.");
    savingRef.current = true;
    const res = await generateFinal(token);
    savingRef.current = false;
    if (!res.ok) return alert(res.body?.message || "Generate final failed");
    setData(res.body.tournament || res.body);
    setMsg("Final generated");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const r = await fetch(LOGIN_API, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ username, password })
      });
      const body = await r.json();
      if (!r.ok) return setLoginError(body.message || "Login failed");
      localStorage.setItem("token", body.token);
      setMsg("Logged in");
    } catch (err) {
      setLoginError("Network error");
    }
  };

  if (loading) return <div className="admin-page">Loading...</div>;

  if (!teamsList.length) {
    return (
      <div className="admin-page">
        <h2>Admin Panel — Setup</h2>
        <div className="auth">
          { token ? <div>Logged in</div> : (
            <form onSubmit={handleLogin} className="login-form">
              <input value={username} placeholder="admin" onChange={e=>setUsername(e.target.value)} />
              <input type="password" value={password} placeholder="password" onChange={e=>setPassword(e.target.value)} />
              <button type="submit">Login</button>
              {loginError && <div className="err">{loginError}</div>}
            </form>
          )}
        </div>

        <TeamInput onSubmit={handleGenerate} />
        {msg && <div className="msg">{msg}</div>}
      </div>
    );
  }

  // groups present
  const groupAMatches = data.matches.filter(m => m.group === "A");
  const groupBMatches = data.matches.filter(m => m.group === "B");

  return (
    <div className="admin-page">
      <h2>Admin — Manage Tournament</h2>
      <div className="admin-controls">
        <button onClick={load}>Refresh</button>
        <button onClick={handleGenerateSemis}>Generate Semifinals</button>
        <button onClick={handleGenerateFinal}>Generate Final</button>
        <button onClick={() => { localStorage.removeItem("token"); window.location.reload(); }}>Logout</button>
      </div>

      {msg && <div className="msg">{msg}</div>}
      <div className="groups-row">
        <GroupStandings title="Group A" teams={data.groups.A} />
        <GroupStandings title="Group B" teams={data.groups.B} />
      </div>

      <h3>Group A Fixtures</h3>
      <div className="fixtures-grid">
        {groupAMatches.map(m => (
          <MatchCard key={m.id} match={m} teamsMap={teamsMap} onAdminSubmit={handleScore} isAdmin />
        ))}
      </div>

      <h3>Group B Fixtures</h3>
      <div className="fixtures-grid">
        {groupBMatches.map(m => (
          <MatchCard key={m.id} match={m} teamsMap={teamsMap} onAdminSubmit={handleScore} isAdmin />
        ))}
      </div>

      {/* show semis & final if present */}
      <h3>Knockout (Semis/Final)</h3>
      <div className="fixtures-grid">
        {data.matches.filter(m => m.group === "SEMIS" || m.group === "FINAL").map(m => (
          <MatchCard key={m.id} match={m} teamsMap={teamsMap} onAdminSubmit={handleScore} isAdmin />
        ))}
      </div>
    </div>
  );
};

export default Admin;
