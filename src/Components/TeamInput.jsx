// src/components/TeamInput.jsx
import React, { useState } from "react";
import "./TeamInput.css";

const TEAM_COUNT = 16;

const TeamInput = ({ onSubmit }) => {
  const [teamNames, setTeamNames] = useState(Array(TEAM_COUNT).fill(""));
  const [error, setError] = useState("");

  // Handle team name input
  const handleChange = (index, value) => {
    const newNames = [...teamNames];
    newNames[index] = value;
    setTeamNames(newNames);
    setError("");
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (teamNames.some((name) => !name.trim())) {
      setError("⚠️ Please enter names for all 16 teams.");
      return;
    }

    if (new Set(teamNames.map((n) => n.trim().toLowerCase())).size < TEAM_COUNT) {
      setError("⚠️ Duplicate team names found. All names must be unique.");
      return;
    }

    onSubmit(teamNames.map((n) => n.trim()));
  };

  return (
    <form onSubmit={handleSubmit} className="team-input-form">
      <h3>Enter {TEAM_COUNT} Team Names</h3>

      <div className="team-input-grid">
        {teamNames.map((name, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Team ${index + 1}`}
            value={name}
            onChange={(e) => handleChange(index, e.target.value)}
            required
            className="team-input-box"
          />
        ))}
      </div>

      {error && <p className="team-input-error">{error}</p>}

      <button type="submit" className="setup-button">
        ✅ Setup Tournament
      </button>
    </form>
  );
};

export default TeamInput;
