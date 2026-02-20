import React, { useEffect, useState } from "react";
import "./App.css";
import ParameterDisplay from "./ParameterDisplayRows";
import LiveBlocks from "./LiveDisplayBlocks";

const TAB_CONFIG = [
  { id: 0, title: "Tab 1", params: [
    { label: "TV_g", key: "TV_g" }, 
    { label: "TC_TV_map", key: "TC_TV_map" }, 
    { label: "Mu", key: "Mu" }, 
    { label: "Bypass", key: "Bypass" }
  ]},
  { id: 1, title: "Tab 2", params: [
    { label: "Mode", key: "Mode" }, 
    { label: "Rgdis", key: "Rgdis" }, 
    { label: "Regagg", key: "Regagg" }, 
    { label: "Plim", key: "Plim" }
  ]},
  { id: 2, title: "Tab 3", params: [
    { label: "Plim_reg", key: "Plim_reg" }, 
    { label: "Tmax", key: "Tmax" }, 
    { label: "Tmax_reg", key: "Tmax_reg" }, 
    { label: "DRS_ON", key: "DRS_ON" }
  ]},
  { id: 3, title: "Tab 4", params: [
    { label: "Fans_on", key: "Fans_on" }, 
    { label: "FR_distr", key: "FR_distr" }, 
    { label: "Keuze 1", key: "Keuze_param1" }, 
    { label: "Keuze 2", key: "Keuze_param2" }
  ]}
]

function App() {
  const [activeTab, setActiveTab] = useState(0);

  const handlePageChange = (pageNumber) => {
    const targetIndex = pageNumber - 1;
    if (targetIndex !== activeTab && targetIndex >= 0 && targetIndex < TAB_CONFIG.length) {
      setActiveTab(targetIndex);
    }
  };

  return (
    <div className="App-container">
      <LiveBlocks />

      <div className="parameter-list-container">
        <ParameterDisplay 
          parameters={TAB_CONFIG[activeTab].params} 
          isActive={true}
          onPageChange={handlePageChange}
        />

        <div className="tab-bar">
          {TAB_CONFIG.map((tab, index) => (
            <div 
              key={tab.id} 
              className={`tab-item ${activeTab === index ? "active" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;