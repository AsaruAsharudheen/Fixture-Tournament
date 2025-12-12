// src/views/Fixture.jsx
import React, { useMemo } from "react";
import { useTournamentData } from "../hooks/useTournamentData";
import MatchCard from "../Components/MatchCard";
import GroupStandings from "../Components/GroupStandings";
import "./Fixture.css";

export default function Fixture() {

  const { data, loading, error } = useTournamentData();

  const teams = [...(data.groups?.A || []), ...(data.groups?.B || [])];

  const teamsMap = useMemo(() => {
    return teams.reduce((acc, t) => {
      acc[t.id] = t;
      return acc;
    }, {});
  }, [teams]);

  const matchOrder = data.matches || [];

  if (loading) return <div className="fixture-page">Loading...</div>;
  if (error) return <div className="fixture-page">Error loading data</div>;
  if (!teams.length) return <div className="fixture-page">Tournament not set up</div>;

  // TIME CREATION
  const startHour = 21;
  const slotTime = 20 + 10; // 20 mins match + 10 mins gap

  const getTime = (i) => {
    const total = startHour * 60 + slotTime * i;
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const hh = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="fixture-bg">
      <div className="fixture-content">

        <h1 className="title">⚽ Tournament Fixtures</h1>

        {/* GROUP STANDINGS */}
        <div className="group-row">
          <GroupStandings title="Group A" teams={data.groups.A} />
          <GroupStandings title="Group B" teams={data.groups.B} />
        </div>

        {/* MATCHES */}
        <h2 className="section-title">Match Schedule</h2>
        <div className="match-list">
          {matchOrder.map((match, index) => (
            <MatchCard
              key={match.id}
              match={{
                ...match,
                startTime: getTime(index),
                ground: match.group,
              }}
              teamsMap={teamsMap}
              isAdmin={false}
            />
          ))}
        </div>

        {/* SEMIFINALS */}
        <h2 className="section-title">Semifinals</h2>
        <div className="match-list">
          {data.matches
            .filter((m) => m.group === "SEMIS")
            .map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                teamsMap={teamsMap}
                isAdmin={false}
              />
            ))}
        </div>

        {/* FINAL */}
        <h2 className="section-title">Final</h2>
        <div className="match-list">
          {data.matches
            .filter((m) => m.group === "FINAL")
            .map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                teamsMap={teamsMap}
                isAdmin={false}
              />
            ))}
        </div>

      </div>
    </div>
  );
}
