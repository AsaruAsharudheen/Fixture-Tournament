// src/views/Fixture.jsx
import React, { useMemo } from "react";
import { useTournamentData } from "../hooks/useTournamentData";
import MatchCard from "../Components/MatchCard";
import GroupStandings from "../Components/GroupStandings";
import "./Fixture.css";

export default function Fixture() {
  const { data, loading, error } = useTournamentData();

  const teams = [...(data.groups?.A || []), ...(data.groups?.B || [])];

  // Map for fast team lookup
  const teamsMap = useMemo(() => {
    return teams.reduce((acc, t) => {
      acc[t.id] = t;
      return acc;
    }, {});
  }, [teams]);

  const matchOrder = data.matches || [];

  // Loading / error states
  if (loading) return <div className="fixture-page">Loading...</div>;
  if (error) return <div className="fixture-page">Error loading data</div>;
  if (!teams.length) return <div className="fixture-page">Tournament not set</div>;

  // TIME FUNCTION
  const startHour = 21;
  const slot = 20 + 10; // 20 mins match + 10 mins gap

  const getTime = (i) => {
    const total = startHour * 60 + slot * i;
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const hh = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  // Separate matches by type
  const groupMatches = matchOrder.filter(
    (m) => m.group === "A" || m.group === "B"
  );

  const semifinal = matchOrder.filter((m) => m.group === "SEMIS")[0]; // only 1
  const finalMatch = matchOrder.filter((m) => m.group === "FINAL")[0];

  return (
    <div className="fixture-bg">
      <div className="fixture-content">

        {/* PAGE TITLE */}
        <h1 className="title">⚽ Tournament Fixtures</h1>

        {/* GROUP STANDINGS */}
        <div className="group-row">
          <GroupStandings title="Group A" teams={data.groups.A} />
          <GroupStandings title="Group B" teams={data.groups.B} />
        </div>

        {/* GROUP MATCHES */}
        <h2 className="section-title">Group Matches</h2>
        <div className="match-list">
          {groupMatches.map((match, index) => (
            <MatchCard
              key={match.id}
              match={{
                ...match,
                startTime: getTime(index),
              }}
              teamsMap={teamsMap}
              isAdmin={false}
            />
          ))}
        </div>

        {/* SEMIFINAL - ONLY ONE */}
        {semifinal && (
          <>
            <h2 className="section-title">Semifinal</h2>
            <div className="match-list">
              <MatchCard
                key={semifinal.id}
                match={semifinal}
                teamsMap={teamsMap}
                isAdmin={false}
              />
            </div>
          </>
        )}

        {/* FINAL */}
        {finalMatch && (
          <>
            <h2 className="section-title">Final</h2>
            <div className="match-list">
              <MatchCard
                key={finalMatch.id}
                match={finalMatch}
                teamsMap={teamsMap}
                isAdmin={false}
              />
            </div>
          </>
        )}

      </div>
    </div>
  );
}
