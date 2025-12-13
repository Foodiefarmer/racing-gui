import React, { useState, useEffect } from 'react';
import './LiveBlocks.css';

function LiveBlocks() {
  // State to hold the live data for the  parameters
  const [parameters, setParameters] = useState([]);

  // useEffect hook to handle the data fetching when the component mounts
  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const response = await fetch('./parameters.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        setParameters(data);
        
      } catch (e) {
        // Handle errors here
        console.error("Failed to fetch parameters:", e);
        setError(e.message);
        
      }
    };
    fetchParameters();
    }, []);

  // Function to render each cell using the data from the state
  const renderParameterCell = (parameter) => (
    <div key={parameter.id} className="live-parameter-cell">
      <h3 className="parameter-name">{parameter.name}</h3>

      <div className="parameter-value">
        **{parameter.value}** {parameter.unit}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="live-display-blocks-container">
        <h2>Error Loading Parameters</h2>
        <p>Could not load `parameters.json`. Please ensure the file exists in the same folder and the structure is valid JSON.</p>
        <p>Details: {error}</p>
      </div>
    );
  }

  return (
    <div className="live-display-blocks-container">

      <div className="live-parameter-grid">
        {parameters.map(renderParameterCell)}
      </div>

    </div>
  );
}

export default LiveBlocks;