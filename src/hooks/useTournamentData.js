import { useState, useEffect, useRef } from "react";
import { fetchTournament } from "../api/tournamentApi";

export function useTournamentData() {
  const [data, setData] = useState({ groups: { A: [], B: [] }, matches: [] });
  const [loading, setLoading] = useState(true);
  const saving = useRef(false);

  const load = async () => {
    const res = await fetchTournament();
    if (res.ok) setData(res.body);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return { data, setData, load, loading, saving };
}
