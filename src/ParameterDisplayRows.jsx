import React, { useState } from "react";
import "./DisplayRows.css";

//Definition of initial parameter values
const initialValues = {
  TV_g: "11",
  TC_TV_map: "68",
  Mu: "1.6",
  Bypass: "0"
};

const ParameterDisplay = () => {
  //useState hook for managing all the parameter values
  const [data, setData] = useState(initialValues);

  const allParameters = [
    {label: "TV_g", key: "TV_g"},
    {label: "TC_TV_map", key: "TC_TV_map"},
    {label: "Mu", key: "Mu"},
    {label: "Bypass", key: "Bypass"}
  ]

  const handleUpdate = (key, newValue) => {
    setData(prevData => ({
      ...prevData,
      [key]: newValue,
    }));
  };

  return (
    //Map through the structure and render all the rows
    <div className="parameter-list-container">
      {allParameters.map((param, index) => {
          const displayValue = data[param.key];

          return (
            <div
              key={param.key}
              className="parameter-row"
            >
              <div className="parameter-label">{param.label}</div>
              <div className="parameter-value">{displayValue}</div>
            </div>
          );
      })}
    </div>
  );
};

export default ParameterDisplay;