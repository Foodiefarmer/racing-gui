import React, { useState, useEffect, useCallback } from "react";
import "./DisplayRows.css";

const ParameterDisplay = ({ parameters, isActive, onPageChange, onFocusChange, activeFocus }) => {
  const UPDATE_INTERVAL_MS = 200;

  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeFocus !== undefined && activeFocus >= 0 && activeFocus < parameters.length) {
      setActiveIndex(activeFocus);
    }
  }, [activeFocus, parameters.length]);

  const fetchParameters = useCallback(async () => {
    try {
      const response = await fetch('/parameters.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonArray = await response.json();
      
      const pageData = jsonArray.find(obj => obj.page !== undefined);
      if (pageData && onPageChange) {
        onPageChange(pageData.page);
      }

      const focusData = jsonArray.find(obj => obj.focus !== undefined);
      if (focusData && onFocusChange) {
        onFocusChange(focusData.focus);
      }

      const formattedData = jsonArray.reduce((acc, item) => {
        if (item.name) {
          acc[item.name] = item.value;
        }
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
  }, [onPageChange, onFocusChange]);

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

  useEffect(() => {
    fetchParameters(); 
    const intervalId = setInterval(() => {
      fetchParameters();
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [fetchParameters]);

  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="parameter-rows-wrapper">
      {parameters.map((param, index) => {
        const displayValue = data[param.key] !== undefined ? data[param.key] : "---";
        const isFocused = index === activeIndex;

        return (
          <div 
            key={param.key} 
            className={`parameter-row ${isFocused ? "focused" : ""}`}
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