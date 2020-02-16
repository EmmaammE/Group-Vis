import React, { useState } from 'react';
import './selectedPanel.css';

function SelectedPanel({title, options = ["test1","test2"]}) {
  const [value, setValue] = useState(title);

  return (
    <div className="selected-panel">
        <div className="divider"><p>{title}</p></div>
        <div className="select">
          <select>
            <option value="hide">{value}</option>
            {options.map((option, index) => (
              <option key={`option-${index}`} value={option}>{option}</option>
            ))}
          </select>
        </div>
    </div>
  );
}

export default SelectedPanel;