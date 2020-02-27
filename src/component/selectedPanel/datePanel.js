import React, { useState, useEffect } from 'react';
import './selectedPanel.css';

const style = {
    pointerEvents: "none",
    cursor:"not-allowed"
}

function DatePanel({title, setClicked, range = [0,0], options = []}) {
  const [expanded, setExpanded] = useState(false);
  const [step, setStep] = useState(0);
  const [low, setLow] = useState(range[0]);
  const [high, setHigh] = useState(range[1]);

  useEffect(() => {
    setLow(options[0]);
    setHigh(options[options.length-1]);
  }, [options])

  function clickLeft() {
    setExpanded(!expanded);
    setStep(1);
  }

  function clickRight() {
    setExpanded(!expanded);
    setStep(2);
  }

  function clickItem(value) {
    switch(step) {
      case 1:
        if(value > high) {
          alert("不合法");
        } else {
          setLow(value);
          setClicked(value, high);
        }
        break;
      case 2:
        if(value < low) {
          alert("不合法");
        } else {
          setHigh(value);
          setClicked(low, value);
        }
        break;
      default:
        console.log(value);
    }
    console.log(step, value);
  }

  return (
    <div className="selected-panel date-panel">
        <div className="divider"><p>{title}</p></div>
        <ul className="dropdown">
            <li
              role="button"
              className="dropdown__selected"
              style={options.length===0?{}:{}}
            >
              <span className="range-block" onClick={clickLeft}>{low}</span>
              <span className="range-divider">-</span>
              <span className="range-block" onClick={clickRight}>{high}</span>
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
                      className={["dropdown__list-item",(option===low||option===high)?"checked":''].join(" ")}
                      onClick = {() => clickItem(option)}
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

export default DatePanel;