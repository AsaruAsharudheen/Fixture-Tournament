// src/api/tournamentApi.js

const BASE = import.meta.env.VITE_API_BASE;
const AUTH = import.meta.env.VITE_AUTH_BASE;

// ----- GENERIC REQUEST WRAPPER -----
async function request(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();

  try {
    return { ok: res.ok, body: JSON.parse(text), status: res.status };
  } catch {
    return { ok: res.ok, body: text, status: res.status };
  }
}

// ----- GET TOURNAMENT -----
export const fetchTournament = () =>
  request(`${BASE}`);

// ----- CREATE GROUPS -----
export const generateGroups = (teams, token) =>
  request(`${BASE}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": token,
    },
    body: JSON.stringify({ teams }),
  });

// ----- UPDATE MATCH -----
export const updateMatch = (payload, token) =>
  request(`${BASE}/update-match`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": token,
    },
    body: JSON.stringify(payload),
  });

// ----- GENERATE SEMIFINALS -----
export const generateSemifinals = (token) =>
  request(`${BASE}/generate-semifinals`, {
    method: "POST",
    headers: { "x-auth-token": token },
  });

// ----- GENERATE FINAL -----
export const generateFinal = (token) =>
  request(`${BASE}/generate-final`, {
    method: "POST",
    headers: { "x-auth-token": token },
  });

// ----- LOGIN -----
export const login = (username, password) =>
  request(`${AUTH}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
