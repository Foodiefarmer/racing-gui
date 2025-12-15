import React from "react";
import "./App.css";
import ParameterDisplay from "./ParameterDisplayRows";
import LiveBlocks from "./LiveDisplayBlocks";

function App() {
  return (
    <div className="App-container">
      <LiveBlocks></LiveBlocks>
      <ParameterDisplay />
    </div>
  )
}
export default App;