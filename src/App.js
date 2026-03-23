import React, { useState, useEffect } from "react";
import "./App.css";
import ParameterDisplay from "./ParameterDisplayRows";
import LiveBlocks from "./LiveDisplayBlocks";

const TAB_CONFIG = [
  { id: 0, title: "Tab 1", params: [{ label: "TV_g", key: "TV_g" }, { label: "TC_TV_map", key: "TC_TV_map" }, { label: "Mu", key: "Mu" }, { label: "Bypass", key: "Bypass" }]},
  { id: 1, title: "Tab 2", params: [{ label: "Mode", key: "Mode" }, { label: "Rgdis", key: "Rgdis" }, { label: "Regagg", key: "Regagg" }, { label: "Plim", key: "Plim" }]},
  { id: 2, title: "Tab 3", params: [{ label: "Plim_reg", key: "Plim_reg" }, { label: "Tmax", key: "Tmax" }, { label: "Tmax_reg", key: "Tmax_reg" }, { label: "DRS_ON", key: "DRS_ON" }]},
  { id: 3, title: "Tab 4", params: [{ label: "Fans_on", key: "Fans_on" }, { label: "FR_distr", key: "FR_distr" }, { label: "Keuze 1", key: "Keuze_param1" }, { label: "Keuze 2", key: "Keuze_param2" }]}
];

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [autodrive, setAutodrive] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      fetch('/parameters.json?t=' + new Date().getTime())
        .then(res => res.json())
        .then(jsonArray => {
          const driveEntry = jsonArray.find(obj => obj.autodrive !== undefined);
          const pageEntry = jsonArray.find(obj => obj.page !== undefined);

          if (driveEntry !== undefined) setAutodrive(driveEntry.autodrive);
          if (pageEntry) setActiveTab(parseInt(pageEntry.page, 10) - 1);
        })
        .catch(e => console.error("Tab fetch error:", e));
    };

    fetchData();
    const interval = setInterval(fetchData, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App-container">
      <LiveBlocks />
      <div className="parameter-list-container">
        <ParameterDisplay 
          activeTab={activeTab} 
          autodrive={autodrive} 
        />

        {!autodrive && (
          <div className="tab-bar" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '25px', // Increased spacing
            marginTop: '30px' 
          }}>
            {TAB_CONFIG.map((tab, index) => {
              const isActive = activeTab === index;
              return (
                <div 
                  key={tab.id} 
                  style={{
                    width: '12px', // 20% smaller than 15px
                    height: '12px', // 20% smaller than 15px
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#000000' : '#a0a0a0',
                    transition: 'background-color 0.2s ease'
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
