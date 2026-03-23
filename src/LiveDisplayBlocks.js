import React, { useState, useEffect, useCallback } from 'react';
import './LiveBlocks.css';

function LiveBlocks() {
  var UPDATE_INTERVAL_MS = 200;
  var [parameters, setParameters] = useState([]);
  var [isLoading, setIsLoading] = useState(true);
  var [error, setError] = useState(null);

  var fetchParameters = useCallback(function() {
    // Adding a timestamp to the URL prevents the old browser from 
    // showing "cached" (old) data instead of live racing data.
    var cacheBuster = new Date().getTime();
    
    fetch('/parameters.json?t=' + cacheBuster)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('HTTP error! status: ' + response.status);
        }
        return response.json();
      })
      .then(function(data) {
        // We use .map with a standard function instead of =>
        var updatedData = data.map(function(p) {
          // Avoid using ...spread. We manually assign properties for compatibility.
          return {
            id: p.id,
            name: p.name,
            unit: p.unit,
            value: p.value || '---',
            timestamp: new Date().toLocaleTimeString()
          };
        });

        setParameters(updatedData);
        setIsLoading(false);
        setError(null);
      })
      .catch(function(e) {
        console.error("CONSOLE: Failed to fetch parameters:", e);
        setError(e.message);
        setIsLoading(false);
      });
  }, []);

  useEffect(function() {
    fetchParameters();
    var intervalId = setInterval(fetchParameters, UPDATE_INTERVAL_MS);
    return function() {
      clearInterval(intervalId);
    };
  }, [fetchParameters]);

  // Regular function instead of arrow function to prevent "Unexpected Token"
  function renderParameterCell(param) {
    return (
      <div key={param.id} className="live-parameter-cell">
        <h3 className="parameter-name">{param.name}</h3>
        <div className="parameter-value">
          {param.value} {param.unit}
        </div>
      </div>
    );
  }

return (
    <div className="live-display-blocks-container">
      <div className="live-parameter-grid">
        {/* .slice(0, 6) takes items from index 0 up to (but not including) 6 */}
        {parameters.slice(0, 6).map(renderParameterCell)}
      </div>
    </div>
  );
}

export default LiveBlocks;
