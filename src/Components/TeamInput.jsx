// src/components/TeamInput.jsx
import React, { useState } from 'react';
import './TeamInput.css';

const TEAM_COUNT = 16;
const initialTeamNames = Array(TEAM_COUNT).fill('');

const TeamInput = ({ onSubmit }) => {
  const [teamNames, setTeamNames] = useState(initialTeamNames);

  const handleChange = (index, value) => {
    const newNames = [...teamNames];
    newNames[index] = value;
    setTeamNames(newNames);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (teamNames.some(name => !name.trim())) {
      alert('Please enter a name for all 16 teams.');
      return;
    }
    onSubmit(teamNames);
  };

  return (
    <form onSubmit={handleSubmit} className="team-input-form">
      <h3>Enter {TEAM_COUNT} Team Names</h3>
      {teamNames.map((name, index) => (
        <input
          key={index}
          type="text"
          placeholder={`Team ${index + 1} Name`}
          value={name}
          onChange={(e) => handleChange(index, e.target.value)}
          required
        />
      ))}
      <button type="submit" className="setup-button">
        Setup Tournament
      </button>
    </form>
  );
};

export default TeamInput;