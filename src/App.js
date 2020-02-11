import React from 'react';
import './App.css';
import FirstPanel from './panel/firstpanel/FirstPanel';
import SecondPanel from './panel/secondpanel/SecondPanel';

function App() {
  return (
    <div className="App">
      <div className="panel">
        <FirstPanel></FirstPanel>
      </div>
      <div className="panel">
        <SecondPanel></SecondPanel>
      </div>
      <div className="panel"></div>
      <div className="panel"></div>
    </div>
  );
}

export default App;