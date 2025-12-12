import React from "react";
import "./GroupStandings.css";

export default function GroupStandings({ title, teams }) {
  const sorted = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_diff !== a.goal_diff) return b.goal_diff - a.goal_diff;
    return b.goals_for - a.goals_for;
  });

  return (
    <div className="standings">
      <h3>{title}</h3>
      <table>
        <thead>
          <tr><th>#</th><th>Team</th><th>Pts</th><th>GF</th><th>GA</th><th>GD</th></tr>
        </thead>
        <tbody>
          {sorted.map((t, i) => (
            <tr key={t.id}>
              <td>{i+1}</td>
              <td>{t.name}</td>
              <td>{t.points}</td>
              <td>{t.goals_for}</td>
              <td>{t.goals_against}</td>
              <td>{t.goal_diff}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
