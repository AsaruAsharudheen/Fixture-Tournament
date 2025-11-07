// src/hooks/useTournamentData.js
import { useState, useEffect, useCallback } from "react";

// 🌐 Backend API endpoint (change if your backend URL differs)
const API_BASE_URL = "https://fixture-tournament-backend.onrender.com/api/tournament";

// Default empty structure to prevent crashes before fetch completes
const INITIAL_DATA = { teams: [], matches: [] };

export const useTournamentData = () => {
  const [data, setData] = useState(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * 🔁 Fetch the tournament data from backend
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error("Failed to fetch tournament data from server.");

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
   * 🚀 Load tournament data immediately + setup polling every 10 seconds
   */
  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000); // Poll backend every 10 seconds
    return () => clearInterval(intervalId);
  }, [fetchData]);

  /**
   * 🧩 Update (POST) tournament data — for admin use
   */
  const setTournamentData = useCallback(
    async (newData) => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required to save data.");
        return;
      }

      // Allow functional updates like React’s setState
      const finalData = typeof newData === "function" ? newData(data) : newData;

      try {
        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token, // 🔐 Secure admin token
          },
          body: JSON.stringify(finalData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              "Failed to save data. Check admin privileges or token expiry."
          );
        }

        const updated = await response.json();
        setData(updated);
        alert("✅ Tournament data saved successfully!");
      } catch (err) {
        console.error("❌ Save error:", err);
        setError("Error saving data: " + err.message);
        // Refresh local data from server to stay in sync
        fetchData();
      }
    },
    [data, fetchData]
  );

  // 🧭 Return data and helpers for consuming components
  return [data, setTournamentData, isLoading, error];
};
