import React, { useState } from 'react';
import './selectedPanel.css'

function GroupPanel({title, startIndex, status=[], options=[], change, cb, cb_all, allStatus}) {
    const [expanded, setExpanded] = useState(false)

    // function expand() {
    //     setExpanded(true)
    // }

    function toggle() {
        setExpanded(!expanded)
    }

    let tempTitle = "";
    return (
        <div>
            <div className="group-title">
                <div className="left">
                    <input type="checkbox"
                            onChange = {cb_all}
                            checked = {allStatus}
                    />
                    <p className='g-text'>{title}</p>
                </div>
                <div className="svg-badge"
                        // onMouseOver={expand}
                        onClick = {toggle}
                    >
                    <svg
                        className={["dropdown__arrow", expanded ? "expanded" : ""].join(" ")}
                        width="10"
                        height="5"
                        viewBox="0 0 10 5"
                        fillRule="evenodd"
                    >
                        <title>Open drop down</title>
                        <path d="M10 0L5 5 0 0z"></path>
                    </svg>
                </div>
            </div>
            <div>
            {
                expanded && options.map((item, index) => {
                    if(tempTitle !== item['r']) {
                        tempTitle = item['r']
                        return (
                            <>
                            <div className={"person-dropdown group-sub-title dropdown__list-item "}
                                key={'t-'+index}
                                onClick={()=>cb(index+startIndex)}
                                // onMouseEnter={()=>cb(index+startIndex,change)}
                            >
                                <input type="checkbox" checked={status[index]} readOnly />
                                <div className="item-container g-text">
                                    {item['r']}
                                    {/* <span className="first-item">{item['label']}</span>
                                    <span></span> */}
                                </div>
                            </div>
                            <div className={"person-dropdown dropdown__list-item"}
                                key={'o-'+index}
                                onClick={()=>cb(index+startIndex)}
                                // onMouseEnter={()=>cb(index+startIndex,change)}
                            >
                                <input type="checkbox" checked={status[index]} readOnly />
                                <div className="item-container g-text">
                                    {item['label']}
                                    {/* <span className="first-item">{item['label']}</span>
                                    <span></span> */}
                                </div>
                            </div>
                            </>
                        )
                    } else {
                        return (
                            <div className={"person-dropdown dropdown__list-item"}
                                key={'o-'+index}
                                onClick={()=>cb(index+startIndex)}
                                // onMouseEnter={()=>cb(index+startIndex,change)}
                            >
                                <input type="checkbox" checked={status[index]} readOnly />
                                <div className="item-container g-text">
                                    {item['label']}
{/* 
                                    <span className="first-item">{item['label']}</span>
                                    <span>{item['r']}</span> */}
                                </div>
                            </div>
                        )
                    }
                   
                })
            }
            </div>
        </div>
        
    )
}

export default GroupPanel