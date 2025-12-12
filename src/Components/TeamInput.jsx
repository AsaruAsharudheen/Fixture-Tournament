import React, { useState } from "react";
import "./TeamInput.css";

export default function TeamInput({ onSubmit }) {
  const [names, setNames] = useState(Array(6).fill(""));

  const handle = (i, v) => {
    const c = [...names];
    c[i] = v;
    setNames(c);
  };

  const submit = (e) => {
    e.preventDefault();
    const list = names.map((n) => n.trim());

    if (list.filter(Boolean).length !== 6) {
      alert("Enter exactly 6 team names.");
      return;
    }

    const teams = list.map((name, i) => ({ id: `t${i + 1}`, name }));
    onSubmit(teams);
  };

  return (
    <form className="team-input" onSubmit={submit}>
      <h3>Enter 6 Teams (3 in Group A, 3 in Group B)</h3>

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
  );
}
