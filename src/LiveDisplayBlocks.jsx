import React, { useState, useEffect, useCallback } from 'react';
import './LiveBlocks.css';

function LiveBlocks() {
  const UPDATE_INTERVAL_MS = 200;
  // State to hold the live data for the  parameters
  const [parameters, setParameters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect hook to handle the data fetching when the component mounts
const fetchParameters = useCallback(async () => {
    try {
      const response = await fetch('/parameters.json'); 
      
      if (!response.ok) {
        // Stop execution if the response is not OK
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Map the fetched configuration data to include a live timestamp
      const updatedData = data.map(p => ({
          ...p,
          value: p.value || '---', 
          timestamp: new Date().toLocaleTimeString(), // Track the update time
      }));
      
      setParameters(updatedData);
      
      // If successful, we are no longer loading
      setIsLoading(false);
      setError(null);

    } catch (e) {
      console.error("Failed to fetch parameters:", e);
      setError(e.message);
      // Only set loading to false if we had an initial load attempt
      if (isLoading) setIsLoading(false);
    }
  }, [isLoading]); // Dependency on isLoading to avoid issues on first run

  // --- useEffect for Initial Load and Polling Interval ---
  useEffect(() => {
    // 1. Run immediately on mount to get the initial data
    fetchParameters(); 

    // 2. Set up the polling interval
    const intervalId = setInterval(() => {
      fetchParameters();
    }, UPDATE_INTERVAL_MS); 

    return () => clearInterval(intervalId);

  }, [fetchParameters]);

  // Function to render each cell using the data from the state
  const renderParameterCell = (param) => (
    <div key={param.id} className="live-parameter-cell">
      <h3 className="parameter-name">{param.name}</h3>

      <div className="parameter-value">
        {param.value} {param.unit}
      </div>
    </div>
  );
  return (
    <div className="live-display-blocks-container">

      <div className="live-parameter-grid">
        {parameters.map(renderParameterCell)}
      </div>

    </div>
  );
}

export default LiveBlocks;