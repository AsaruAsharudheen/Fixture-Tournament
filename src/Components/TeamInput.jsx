import React, { useState } from "react";
import "./TeamInput.css";

export default function TeamInput({ onSubmit }) {
  const [names, setNames] = useState(Array(8).fill(""));

  const handle = (i, v) => {
    const c = [...names];
    c[i] = v;
    setNames(c);
  };

  const submit = (e) => {
    e.preventDefault();
    const list = names.map((n) => n.trim());
    if (list.filter(Boolean).length !== 8) {
      alert("Enter exactly 8 team names.");
      return;
    }
    const teams = list.map((name, i) => ({ id: `t${i+1}`, name }));
    onSubmit(teams);
  };

  return <>
   <div className="fixture-bg">
    <form className="team-input" onSubmit={submit}>
      <h3>Enter 8 Teams (4 teams Group A, 4 teams Group B)</h3>
      <div className="team-grid">
        {names.map((n, i) => (
          <input
            key={i}
            value={n}
            onChange={(e) => handle(i, e.target.value)}
            placeholder={`Team ${i + 1}`}
          />
        ))}
      </div>
      <button type="submit">Generate Tournament</button>
    </form>
    </div>
    </>
  
}
