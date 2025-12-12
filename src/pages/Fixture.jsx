// src/pages/Fixture.jsx
import React, { useMemo } from "react";
import { useTournamentData } from "../hooks/useTournamentData";
import MatchCard from "../Components/MatchCard";
import GroupStandings from "../Components/GroupStandings";
// import "./fixture.css";

const Fixture = () => {
  const { data, loading, error } = useTournamentData();
  const teams = [...(data.groups?.A || []), ...(data.groups?.B || [])];
  const teamsMap = useMemo(() => teams.reduce((a,t)=>{ a[t.id]=t; return a; }, {}), [teams]);

  if (loading) return <div className="fixture-page">Loading...</div>;
  if (error) return <div className="fixture-page error">Error: {error}</div>;

  const groupA = data.groups.A || [];
  const groupB = data.groups.B || [];
  const groupAMatches = (data.matches || []).filter(m => m.group === "A");
  const groupBMatches = (data.matches || []).filter(m => m.group === "B");
  const semis = (data.matches || []).filter(m => m.group === "SEMIS");
  const finalM = (data.matches || []).filter(m => m.group === "FINAL");

  return (
    <div className="fixture-page">
      <h1>Tournament Fixture</h1>

      <div className="top-section">
        <GroupStandings title="Group A" teams={groupA} />
        <GroupStandings title="Group B" teams={groupB} />
      </div>

      <section>
        <h2>Group A Matches</h2>
        <div className="fixtures-grid">
          {groupAMatches.map(m => <MatchCard key={m.id} match={m} teamsMap={teamsMap} />)}
        </div>
      </section>

      <section>
        <h2>Group B Matches</h2>
        <div className="fixtures-grid">
          {groupBMatches.map(m => <MatchCard key={m.id} match={m} teamsMap={teamsMap} />)}
        </div>
      </section>

      <section>
        <h2>Semifinals</h2>
        <div className="fixtures-grid">
          {semis.map(m => <MatchCard key={m.id} match={m} teamsMap={teamsMap} />)}
        </div>
      </section>

      <section>
        <h2>Final</h2>
        <div className="fixtures-grid">
          {finalM.map(m => <MatchCard key={m.id} match={m} teamsMap={teamsMap} />)}
        </div>
      </section>
    </div>
  );
};

export default Fixture;
