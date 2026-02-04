import React, { useState, useEffect, useCallback } from "react";
import "./DisplayRows.css";

const ParameterDisplay = ({ parameters, isActive}) => {
  const UPDATE_INTERVAL_MS = 200;

  // State to hold the live data for the parameters
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeIndex, setActiveIndex] =useState(0);

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

  //Event listener for the focus
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event) => {
      if (event.key === "ArrowDown") {
        setActiveIndex((prev) => (prev + 1) % parameters.length);
      } else if (event.key === "ArrowUp") {
        setActiveIndex((prev) => (prev - 1 + parameters.length) % parameters.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [parameters.length, isActive]);

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
        {parameters.map((param, index) => {
        const displayValue = data[param.key] !== undefined ? data[param.key] : "---";
        const isFocused = index === activeIndex;

        return (
          <div 
            key={param.key} 
            className={`parameter-row ${isFocused ? "focused" : ""}`} // Schoner dan je oude versie
          >
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