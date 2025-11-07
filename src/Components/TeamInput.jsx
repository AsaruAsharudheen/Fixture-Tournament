import React, { useState } from "react";
import "./TeamInput.css";

const TeamInput = ({ onSubmit }) => {
  const [teamNames, setTeamNames] = useState(Array(16).fill(""));

  const handleChange = (index, value) => {
    const updated = [...teamNames];
    updated[index] = value;
    setTeamNames(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // ✅ Prevent browser reload
    onSubmit(teamNames);
  };

  return (
    <form className="team-input-form" onSubmit={handleSubmit}>
      <h2>Enter 16 Team Names</h2>
      <div className="team-grid">
        {teamNames.map((name, i) => (
          <input
            key={i}
            type="text"
            value={name}
            onChange={(e) => handleChange(i, e.target.value)}
            placeholder={`Team ${i + 1}`}
            required
          />
        ))}
      </div>
      <button type="submit">Save Teams</button>
    </form>
  );
};

export default TeamInput;
