// src/api/tournamentApi.js
const BASE = process.env.REACT_APP_API_BASE || "https://fixture-tournament-backend.onrender.com/api/tournament";

async function request(path = "", opts = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, opts);
  const text = await res.text();
  try {
    return { ok: res.ok, body: text ? JSON.parse(text) : null, status: res.status };
  } catch {
    return { ok: res.ok, body: text, status: res.status };
  }
}

export async function fetchTournament() {
  return request("/");
}

export async function generateGroups(teams, token) {
  return request("/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": token,
    },
    body: JSON.stringify({ teams }),
  });
}

export async function updateMatch(matchId, scoreA, scoreB, token) {
  return request("/update-match", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": token,
    },
    body: JSON.stringify({ matchId, scoreA, scoreB }),
  });
}

export async function generateSemifinals(token) {
  return request("/generate-semifinals", {
    method: "POST",
    headers: { "x-auth-token": token },
  });
}

export async function generateFinal(token) {
  return request("/generate-final", {
    method: "POST",
    headers: { "x-auth-token": token },
  });
}
