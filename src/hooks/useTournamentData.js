// src/hooks/useTournamentData.js
import { useState, useCallback, useEffect, useRef } from "react";
import { fetchTournament } from "../api/tournamentApi";

const EMPTY = { groups: { A: [], B: [] }, matches: [] };

export const useTournamentData = () => {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const saving = useRef(false);

  const load = useCallback(async () => {
    if (saving.current) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTournament();
      if (!res.ok) throw new Error(res.body?.message || "Failed to fetch");
      setData(res.body || EMPTY);
    } catch (err) {
      console.error(err);
      setError(err.message || "Fetch error");
      setData(EMPTY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, setData, load, loading, error, savingRef: saving };
};
