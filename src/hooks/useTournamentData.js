// src/hooks/useTournamentData.js
import { useState, useEffect, useCallback } from 'react';

// Define your backend API URL (Ensure this matches your server's address)
const API_BASE_URL = 'http://localhost:5000/api/tournament'; 
const INITIAL_DATA = { teams: [], matches: [] };

export const useTournamentData = () => {
    const [data, setData] = useState(INITIAL_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch the current tournament data (used by Fixture and Admin)
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch tournament data from server.');
            }
            const data = await response.json();
            // If data is null/empty (server not set up), use initial state
            setData(data || INITIAL_DATA); 
        } catch (err) {
            console.error("Fetch error:", err);
            setError('Could not connect to the tournament backend.');
            setData(INITIAL_DATA); 
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Fetch immediately on mount
        fetchData(); 
        
        // Setup polling for periodic updates (e.g., public view refreshes automatically)
        const intervalId = setInterval(fetchData, 10000); // Poll every 10 seconds
        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, [fetchData]);

    // Function to update the data on the server (Admin use only)
    const setTournamentData = useCallback(async (newData) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Authentication required to save data.');
            return;
        }

        // Handle both function updates (setTournamentData(prev => ...)) and direct object updates
        const finalData = typeof newData === 'function' ? newData(data) : newData;

        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token, // Send JWT for secure admin access
                },
                body: JSON.stringify(finalData),
            });

            if (!response.ok) {
                // Check for 401 Unauthorized errors from middleware
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save data. Check admin privileges or token expiry.');
            }

            const updatedData = await response.json();
            setData(updatedData); // Update local state with server's response
            alert('Tournament data saved successfully!');
        } catch (err) {
            console.error("Save error:", err);
            setError('Error saving data: ' + err.message);
            // Re-fetch to synchronize with the current server state if save fails
            fetchData(); 
        }
    }, [data, fetchData]);

    return [data, setTournamentData, isLoading, error];
};