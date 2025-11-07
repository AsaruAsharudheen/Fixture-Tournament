// src/views/Fixture.jsx
import React, { useMemo } from 'react';
import { useTournamentData } from '../hooks/useTournamentData'; // <-- CHANGE
import './fixture.css';
import MatchCard from '../Components/MatchCard';

// Tournament Timing Constants (unchanged)
const START_HOUR = 21; // 9 PM (21:00)
const MATCH_DURATION = 20; // minutes
const GAP_DURATION = 10; // minutes
const SLOT_DURATION = MATCH_DURATION + GAP_DURATION; // 30 minutes total

// Helper to calculate time based on match index (1-based)
const calculateStartTime = index => {
  // Total minutes elapsed since start of Match #1
  const minutesElapsed = (index - 1) * SLOT_DURATION;

  // Initial start time in minutes from midnight
  const initialMinutes = START_HOUR * 60;

  const totalMinutes = initialMinutes + minutesElapsed;

  const hour = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;

  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const ampm = hour >= 12 ? 'PM' : 'AM';

  const paddedMinute = String(minute).padStart(2, '0');

  return `${displayHour}:${paddedMinute} ${ampm}`;
};

const Fixture = () => {
  // Use the new backend-aware hook
  const [tournamentData, , isLoading, error] = useTournamentData();
  const { teams, matches } = tournamentData;

  const teamsMap = useMemo(
    () => teams.reduce((acc, team) => ({ ...acc, [team.id]: team }), {}),
    [teams]
  );

  if (isLoading) {
        return (
            <div className="fixture-placeholder">
                <h1>⚽ 7's Football Tournament 🏆</h1>
                <p>Loading the latest tournament schedule...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixture-placeholder error">
                <h1>❌ Connection Error ❌</h1>
                <p>{error}</p>
                <p>Ensure the server is running and try refreshing the page.</p>
            </div>
        );
    }
    
  if (!teams.length) {
    return (
      <div className="fixture-placeholder">
        <h1>⚽ 7's Football Tournament 🏆</h1>
        <p>
          The **tournament bracket** is not yet set up by the admin. Please
          check back later!
        </p>
      </div>
    );
  }

  // Combine all match arrays for scheduling purposes
  const allMatches = [
    ...matches.filter(m => m.round === 'R1'),
    ...matches.filter(m => m.round === 'QF'),
    ...matches.filter(m => m.round === 'SF'),
    ...matches.filter(m => m.round === 'T3'),
    ...matches.filter(m => m.round === 'F'),
  ];

  // Sort matches linearly: R1 -> QF -> SF -> T3 -> F
  const roundOrder = { R1: 1, QF: 2, SF: 3, T3: 4, F: 5 };

  const scheduledMatches = allMatches
    .sort((a, b) => {
      const orderA = roundOrder[a.round] * 10 + a.match_num;
      const orderB = roundOrder[b.round] * 10 + b.match_num;
      return orderA - orderB;
    })
    .map((match, index) => ({
      ...match,
      startTime: calculateStartTime(index + 1),
    }));

  // Re-filter the scheduled matches back into their round groups
  const scheduledRounds = {
    R1: scheduledMatches.filter(m => m.round === 'R1'),
    QF: scheduledMatches.filter(m => m.round === 'QF'),
    SF: scheduledMatches.filter(m => m.round === 'SF'),
    T3: scheduledMatches.filter(m => m.round === 'T3'),
    F: scheduledMatches.filter(m => m.round === 'F'),
  };

  const leftMatchesR1 = scheduledRounds.R1.slice(0, 4);
  const rightMatchesR1 = scheduledRounds.R1.slice(4, 8);

  const leftMatchesQF = scheduledRounds.QF.slice(0, 2);
  const rightMatchesQF = scheduledRounds.QF.slice(2, 4);

  return (
    <div className="fixture-wrapper">
      <h1 className="fixture-header">
        ⚽ 7's Football Tournament Presented by Lucky Star Moloor🏆
      </h1>
      <h2 className="schedule-info">
        Starts: 9:00 PM | Match Duration: {MATCH_DURATION} mins | Gap:{' '}
        {GAP_DURATION} mins
      </h2>

      <div className="fixture-container">
        {/* Column 1: R1 Left Side */}
        <div className="round-column">
          <h3>Round of 16 (Left)</h3>
          <div className="r1-group">
            {leftMatchesR1.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                teamsMap={teamsMap}
                isAdmin={false}
              />
            ))}
          </div>
        </div>

        <div className="round-column">
          <h3>Round of 16 (Right)</h3>
          <div className="r1-group">
            {rightMatchesR1.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                teamsMap={teamsMap}
                isAdmin={false}
              />
            ))}
          </div>
        </div>

        {/* Column 2: QF Left Side */}
        <div className="round-column">
          <h3>Quarter Finals (Left)</h3>
          <div className="r1-group">
            {leftMatchesQF.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                teamsMap={teamsMap}
                isAdmin={false}
              />
            ))}
          </div>
        </div>
        <div className="round-column right-aligned">
          <h3>Quarter Finals (Right)</h3>
          <div className="r1-group">
            {rightMatchesQF.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                teamsMap={teamsMap}
                isAdmin={false}
              />
            ))}
          </div>
        </div>

        {/* Column 3: Semi Finals, 3rd Place, & FINAL (Center) */}
        <div className="round-column center-aligned">
          <h3>Semi Finals</h3>
          <div className="r1-group sf-group">
            {scheduledRounds.SF.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                teamsMap={teamsMap}
                isAdmin={false}
              />
            ))}
          </div>

          {/* 3rd Place Match */}
          <div className="third-place-card">
            {scheduledRounds.T3.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                teamsMap={teamsMap}
                isAdmin={false}
              />
            ))}
          </div>

          <div className="final-card">
            <h2>🏆 GRAND FINAL 🏆</h2>
            {scheduledRounds.F.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                teamsMap={teamsMap}
                isAdmin={false}
              />
            ))}
          </div>
        </div>

        {/* The structure is set up for a dynamic bracket view */}
      </div>
    </div>
  );
};

export default Fixture;