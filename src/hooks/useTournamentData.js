import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE_URL = "https://fixture-tournament-backend.onrender.com/api/tournament";
const INITIAL_DATA = { teams: [], matches: [] };

export const useTournamentData = () => {
  const [data, setData] = useState(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isSaving = useRef(false); // Prevent overlapping updates

  /**
   * 🔁 Fetch tournament data from backend (once or manually)
   */
  const fetchData = useCallback(async () => {
    if (isSaving.current) return; // Skip fetch during save
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error("Failed to fetch tournament data.");

      const result = await response.json();
      setData(result || INITIAL_DATA);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Could not connect to the tournament backend.");
      setData(INITIAL_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 🚀 Fetch once on first mount (no more polling)
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * 🧩 Save (POST) tournament data manually
   */
  const setTournamentData = useCallback(
    async (newData) => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required to save data.");
        return;
      }

      const finalData =
        typeof newData === "function" ? newData(data) : newData;

      try {
        isSaving.current = true; // Pause fetchData while saving

        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify(finalData),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.message || "Failed to save tournament data."
          );
        }

        const updated = await response.json();
        setData(updated);
      } catch (err) {
        console.error("❌ Save error:", err);
        setError("Error saving data: " + err.message);
      } finally {
        isSaving.current = false;
        setIsLoading(false);
      }
    },
    [data]
  );

  return [data, setTournamentData, isLoading, error];
};
