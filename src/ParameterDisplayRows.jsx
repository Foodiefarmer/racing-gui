import React, { useState, useEffect, useCallback } from "react";
import "./DisplayRows.css";

const ParameterDisplay = () => {
  const UPDATE_INTERVAL_MS = 200;

  // State to hold the live data for the parameters
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const allParameters = [
    { label: "TV_g", key : "TV_g" },
    { label: "TC_TV_map", key: "TC_TV_map" },
    { label: "Mu", key: "Mu" },
    { label: "Bypass", key: "Bypass" }
  ];

  // Function to fetch data and convert the array to an object
  const fetchParameters = useCallback(async () => {
    try {
      const response = await fetch('/parameters.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonArray = await response.json();
      
      // Convert the array [ {name: "TV_g", value: "11"}, ... ] 
      // into an object { TV_g: "11", ... } to match initial structure
      const formattedData = jsonArray.reduce((acc, item) => {
        acc[item.name] = item.value;
        return acc;
      }, {});

      setData(formattedData);
      setIsLoading(false);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch parameters:", e);
      setError(e.message);
      if (isLoading) setIsLoading(false);
    }
  }, [isLoading]);

  // Handle Polling
  useEffect(() => {
      fetchParameters(); 

      const intervalId = setInterval(() => {
        fetchParameters();
      }, UPDATE_INTERVAL_MS);

      return () => clearInterval(intervalId);
    }, [fetchParameters]);

    if (error) return <div className="error">Error: {error}</div>

    return (
    <div className="parameter-list-container">
      {allParameters.map((param) => {
        // Look up the value from the live state using the key
        const displayValue = data[param.key] !== undefined ? data[param.key] : "---";

        return (
          <div key={param.key} className="parameter-row">
            <div className="parameter-label">{param.label}</div>
            <div className="parameter-value">
                {isLoading && displayValue === "---" ? "Loading..." : displayValue}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ParameterDisplay;