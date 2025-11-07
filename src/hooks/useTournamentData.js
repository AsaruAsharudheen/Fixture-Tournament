// src/hooks/useTournamentData.js
import { useState, useEffect, useCallback } from 'react';

// Define your backend API URL (Updated to Render deployment)
const API_BASE_URL = 'https://fixture-tournament-backend.onrender.com/api/tournament'; 
const INITIAL_DATA = { teams: [], matches: [] };

export const useTournamentData = () => {
    const [data, setData] = useState(INITIAL_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch the current tournament data 
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch tournament data from server.');
            }
            const data = await response.json();
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
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save data. Check admin privileges or token expiry.');
            }

            const updatedData = await response.json();
            setData(updatedData); 
            alert('Tournament data saved successfully!');
        } catch (err) {
            console.error("Save error:", err);
            setError('Error saving data: ' + err.message);
            fetchData(); 
        }
    }, [data, fetchData]);

    return [data, setTournamentData, isLoading, error];
};