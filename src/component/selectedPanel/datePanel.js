import React, { useState, useEffect } from 'react';
import './selectedPanel.css';

const style = {
    pointerEvents: "none",
    cursor:"not-allowed"
}

function DatePanel({title, setClicked, range = [0,0], options = []}) {
  const [expanded, setExpanded] = useState(false);
  const [step, setStep] = useState(0);
  const [showLow, setShowLow] = useState(range[0]);
  const [showHigh, setShowHigh] = useState(range[1]);

  useEffect(() => {
    setShowLow(range[0]);
    setShowHigh(range[1]);
  }, [range])

  function clickItem(value) {
    switch(step) {
      case 1:
        if(value > showHigh) {
          alert("不合法");
        } else {
          setClicked(value, showHigh);
        }
        break;
      case 2:
        if(value < showLow) {
          alert("不合法");
        } else {
          setClicked(showLow, value);
        }
        break;
      default:
        console.log(value);
    }
    console.log(step, value);
  }

  function handleChange1(event) {
    setShowLow(event.target.value)
  }

  function handleFocus1() {
    setShowLow("")
    if(options.length > 0) {
      setExpanded(true);
      setStep(1);
    }
  }

  function handleBlur1() {
    if(showLow === "") {
      setShowLow(range[0])
    } else {
      setClicked(showLow, showHigh)
    }
    options.length > 0 && setExpanded(false);
  }

  function handleChange2(event) {
    setShowHigh(event.target.value)
  }

  function handleFocus2() {
    setShowHigh("")
    if(options.length > 0) {
      setExpanded(true);
      setStep(2);
    }
  }

  function handleBlur2() {
    if(showHigh==="") {
      setShowHigh(range[1])
    } else {
      setClicked(showLow, showHigh)
    }
    options.length > 0 && setExpanded(false);
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
              <span className="range-block left">
                <input value={showLow} onChange={handleChange1} 
                  onFocus={handleFocus1} onBlur={handleBlur1}/>
              </span>
              <span className="range-divider">-</span>
              <span className="range-block right">
                <input value={showHigh} onChange={handleChange2} 
                  onFocus={handleFocus2} onBlur={handleBlur2}/>
              </span>
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
                      className={["dropdown__list-item",(option===range[0]||option===range[1])?"checked":''].join(" ")}
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