import React from 'react';
import './App.css';
import FirstPanel from './panel/firstpanel/FirstPanel';
import SecondPanel from './panel/secondpanel/SecondPanel';
import ThirdPanel from './panel/thirdpanel/ThirdPanel';
import FourthPanel from './panel/fourthpanel/FourthPanel';

function App() {
  return (
    <div className="App">
      <div className="panel">
        <FirstPanel></FirstPanel>
      </div>
      <div className="panel">
        <SecondPanel></SecondPanel>
      </div>
      <div className="panel">
        <ThirdPanel></ThirdPanel>
      </div>
      <div className="panel">
        <FourthPanel></FourthPanel>
      </div>
    </div>
  );
}

export default App;