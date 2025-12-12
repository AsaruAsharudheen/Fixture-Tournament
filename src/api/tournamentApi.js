// src/api/tournamentApi.js

const BASE = import.meta.env.VITE_API_BASE;
const AUTH = import.meta.env.VITE_AUTH_BASE;

// Generic requester
async function request(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();

  try {
    return { ok: res.ok, body: JSON.parse(text), status: res.status };
  } catch {
    return { ok: res.ok, body: text, status: res.status };
  }
}

// Get full tournament data
export const fetchTournament = () =>
  request(`${BASE}`);

// Create groups with 8 teams
export const generateGroups = (teams, token) =>
  request(`${BASE}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": token,
    },
    body: JSON.stringify({ teams }),
  });

// Update match (supports penalties)
export const updateMatch = (payload, token) =>
  request(`${BASE}/update-match`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": token,
    },
    body: JSON.stringify(payload),
  });

// Generate semifinals
export const generateSemifinals = (token) =>
  request(`${BASE}/generate-semifinals`, {
    method: "POST",
    headers: {
      "x-auth-token": token,
    },
  });

// Generate final
export const generateFinal = (token) =>
  request(`${BASE}/generate-final`, {
    method: "POST",
    headers: {
      "x-auth-token": token,
    },
  });

// Login admin
export const login = (username, password) =>
  request(`${AUTH}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
