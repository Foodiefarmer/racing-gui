import React from "react";
import "./App.css";
import ParameterDisplay from "./ParameterDisplayRows";
import LiveBlocks from "./LiveDisplayBlocks";

function App() {
  return (
    <div className="App-container">
      <LiveBlocks></LiveBlocks>
      <h1>does this work?</h1>
      <ParameterDisplay />
    </div>
  )
}
export default App;