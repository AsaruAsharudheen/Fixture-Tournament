// src/components/GroupStandings.jsx
import React from "react";
// import "./groupstandings.css";

/*
 expects props:
  teams: array of { id, name, points, goals_for, goals_against, goal_diff }
*/
const GroupStandings = ({ title, teams = [] }) => {
  const sorted = [...teams].sort((a,b) => {
    if ((b.points||0) !== (a.points||0)) return (b.points||0)-(a.points||0);
    if ((b.goal_diff||0) !== (a.goal_diff||0)) return (b.goal_diff||0)-(a.goal_diff||0);
    return (b.goals_for||0)-(a.goals_for||0);
  });

  return (
    <div className="standings">
      <h4>{title}</h4>
      <table>
        <thead><tr><th>#</th><th>Team</th><th>Pts</th><th>GF</th><th>GA</th><th>GD</th></tr></thead>
        <tbody>
          {sorted.map((t, i) => (
            <tr key={t.id}>
              <td>{i+1}</td>
              <td>{t.name}</td>
              <td>{t.points ?? 0}</td>
              <td>{t.goals_for ?? 0}</td>
              <td>{t.goals_against ?? 0}</td>
              <td>{t.goal_diff ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupStandings;
