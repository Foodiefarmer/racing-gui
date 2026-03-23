import React, { useState, useEffect, useCallback } from "react";
import "./DisplayRows.css";

const ParameterDisplay = () => {
  var UPDATE_INTERVAL_MS = 200;
  var ITEMS_PER_PAGE = 4;
  var SKIP_COUNT = 6;

  const [parameters, setParameters] = useState([]);
  const [autodrive, setAutodrive] = useState(false);
  const [page, setPage] = useState(1);
  const [focus, setFocus] = useState(1);

  const fetchParameters = useCallback(function() {
    var cacheBuster = new Date().getTime();
    fetch('/parameters.json?t=' + cacheBuster)
      .then(function(response) {
        if (!response.ok) throw new Error('HTTP error');
        return response.json();
      })
      .then(function(jsonArray) {
        // 1. EXTRACT METADATA (Look for "autodrive")
        var autodriveEntry = jsonArray.find(obj => obj.autodrive !== undefined);
        var pageEntry = jsonArray.find(obj => obj.page !== undefined);
        var focusEntry = jsonArray.find(obj => obj.focus !== undefined);

        // 2. UPDATE LOCAL STATES
        if (autodriveEntry !== undefined) setAutodrive(autodriveEntry.autodrive);
        if (pageEntry) setPage(parseInt(pageEntry.page, 10));
        if (focusEntry) setFocus(parseInt(focusEntry.focus, 10));

        // 3. MAP PARAMETERS
        var updatedData = jsonArray.map(p => ({
          id: p.id,
          name: p.name,
          unit: p.unit,
          value: p.value !== undefined ? p.value : '---'
        }));
        setParameters(updatedData);
      })
      .catch(e => console.error("Fetch error:", e));
  }, []);

  useEffect(function() {
    fetchParameters();
    var intervalId = setInterval(fetchParameters, UPDATE_INTERVAL_MS);
    return function() { clearInterval(intervalId); };
  }, [fetchParameters]);

  // Pagination Logic
  var startIndex = SKIP_COUNT + ((page - 1) * ITEMS_PER_PAGE);
  var displayList = parameters.filter(p => p.id !== undefined);
  var paginatedParameters = displayList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="parameter-rows-wrapper">
      {autodrive ? (
        /* Autodrive Overlay */
        <div className="autonomous-mode-overlay">
          <h2>AUTONOMOUS MODE ACTIVE</h2>
        </div>
      ) : (
        /* Paginated List */
        paginatedParameters.map(function(param) {
          // THE LOGIC ONE-LINER
          var isFocused = param.id == (6 + 4 * (page - 1) + focus);

          return (
            <div 
              key={param.id} 
              className="parameter-row"
              style={{ 
                backgroundColor: isFocused ? '#b0d6ff' : 'white',
                color: isFocused ? 'black' : 'inherit'
              }}
            >
              <div className="parameter-label">{param.name}</div>
              <div className="parameter-value">
                {param.value} <span className="unit">{param.unit}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ParameterDisplay;
