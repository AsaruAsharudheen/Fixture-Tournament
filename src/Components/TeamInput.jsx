// src/components/TeamInput.jsx
import React, { useState } from "react";
import "./teaminput.css";

const TeamInput = ({ onSubmit }) => {
  const [names, setNames] = useState(Array(8).fill(""));

  const change = (i, v) => {
    const c = [...names]; c[i] = v; setNames(c);
  };

  const submit = (e) => {
    e.preventDefault();
    const filled = names.map(n => n.trim()).filter(Boolean);
    if (filled.length !== 8) {
      alert("Please enter exactly 8 team names (no blanks).");
      return;
    }
    // convert to objects expected by backend: { id, name }
    const teams = names.map((n, i) => ({ id: `t${i+1}`, name: n }));
    onSubmit(teams);
  };

  return (
    <form className="team-input" onSubmit={submit}>
      <h3>Enter 8 teams (Group A: first 4, Group B: next 4)</h3>
      <div className="team-grid">
        {names.map((nm, i) => (
          <input key={i} value={nm} onChange={(e) => change(i, e.target.value)} placeholder={`Team ${i+1}`} />
        ))}
      </div>
      <button type="submit">Generate Groups & Matches</button>
    </form>
  );
};

export default TeamInput;
