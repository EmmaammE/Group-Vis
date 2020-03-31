import React, { useState } from 'react';
import './selectedPanel.css';

// _type === 1： 第一个元素是all； 
function SelectedPanel({title, _type, setClicked, clicked = [], options = []}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="selected-panel">
        <div className="divider"><p>{title}</p></div>
        <ul className="dropdown">
            <li className="dropdown__container">
            <div
              role="button"
              aria-labelledby="dropdown-label"
              className="dropdown__selected"
              style={options.length===0?{pointerEvents: "none"}:{}}
              onClick={()=>setExpanded(!expanded)}
            >
              {
                options.map((val,i) => {
                  if(clicked[i]) {
                    return (<span key={'icon-'+i} className="icon" onClick={(event) => {
                      event.stopPropagation();
                      setClicked(i)
                    }}>{val[1]}</span>)
                  } else {
                    return null;
                  }
                })
              }
            </div>
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
                      key={`option-${index}`} value={option[1]}
                      className={"dropdown__list-item"}
                      onClick = {() => setClicked(index)}
                    >
                      <input type="checkbox" checked={clicked[index]} readOnly/>
                      {index === 0 && option[0]==='all'?'Selected all  ': option[1]}
                    </li> 
                  ))
                }
               
              </ul>
            </li>
            <li className="dropdown__mask" onMouseOut={()=>{
                  setExpanded(false);
                }}></li>
          </ul>
    </div>
  );
}

export default SelectedPanel;