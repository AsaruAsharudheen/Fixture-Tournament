// src/views/Fixture.jsx
import React from 'react';
import { useTournamentData } from '../components/LocalStorage';
import Bracket from '../components/Bracket'; 

const Fixture = () => {
  const [tournamentData] = useTournamentData('tournament', { teams: [], matches: [] });
  
  if (!tournamentData.teams.length) {
    return <p>Tournament is not yet set up. Check back later!</p>;
  }

  // The Bracket component will handle the complex drawing logic
  return (
    <div>
      <h2>📅 Tournament Fixture 📅</h2>
      <Bracket data={tournamentData} /> 
      
      {/* Example structure for R1: 4 matches left, 4 matches right */}
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div>
          <h3>Round of 16 (Left Side)</h3>
          {/* Filter and display first 4 R1 matches */}
        </div>
        <div>
          <h3>Round of 16 (Right Side)</h3>
          {/* Filter and display next 4 R1 matches */}
        </div>
      </div>
      
      {/* ... structure for Quarter, Semi, and Final */}
    </div>
  );
};
export default Fixture;