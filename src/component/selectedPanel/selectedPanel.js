import React, { useState } from 'react';
import './selectedPanel.css';

function SelectedPanel({title, setClicked, clicked = [], options = []}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="selected-panel">
        <div className="divider"><p>{title}</p></div>
        <ul className="dropdown">
            <li
              role="button"
              aria-labelledby="dropdown-label"
              className="dropdown__selected"
              style={options.length===0?{pointerEvents: "none"}:{}}
              onClick={()=>setExpanded(!expanded)}
            >
              {
                options.map((val,i) => {
                  if(clicked[i]) {
                    return (<span key={'icon-'+i} className="icon">{val}</span>)
                  } else {
                    return null;
                  }
                })
              }
            </li>
            <svg
              className={["dropdown__arrow",expanded?"expanded":""].join(" ")}
              width="10"
              height="5"
              viewBox="0 0 10 5"
              fillRule="evenodd"
            >
              <title>Open drop down</title>
              <path d="M10 0L5 5 0 0z"></path>
            </svg>
            <li role="list" className="dropdown__list-container">
              <ul className={expanded?"dropdown__list open":"dropdown__list"}>
                {
                  options.map((option, index) => (
                    <li 
                      key={`option-${index}`} value={option}
                      className={["dropdown__list-item",clicked[index]?"checked":''].join(" ")}
                      onClick = {() => setClicked(index)}
                    >{option}
                      <div className="item-control"></div>
                    </li> 
                  ))
                }
              </ul>
            </li>
          </ul>
    </div>
  );
}

export default SelectedPanel;