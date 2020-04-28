import React, { useState, useMemo } from 'react';
import './selectedPanel.css'

const handleData = data => {
    let tempTitle = "";
    let groups = [];
    data.forEach((d, index) => {
        if(d['r'] !== tempTitle) {
            groups.push(index);
            tempTitle = d['r']
        }
    })
    groups.push(data.length)
    return groups;
}
function GroupPanel({title, startIndex, status={}, options=[], change, cb, cb_all, allStatus}) {
    const [expanded, setExpanded] = useState(false)
    const groups = useMemo(() => handleData(options),[options])
    // function expand() {
    //     setExpanded(true)
    // }

    function toggle() {
        setExpanded(!expanded)
    }

    function clickAll(event) {
        cb(options.map(e => e['value']), event.target.checked)
        // cb_all();
    }
    
    let tempTitle = "";
    let start = 0;
    return (
        <div>
            <div className="group-title">
                <div className="left">
                    <input type="checkbox"
                        onChange = {clickAll}
                        checked = { options.filter(e=>!status[e['value']]).length === 0}
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

                        let thisArr = options.slice(groups[start], groups[start+1]).map(e=>e['value'])
                        let $ele = (
                            <>
                            <div className={"person-dropdown group-sub-title dropdown__list-item "}
                                key={'t-'+start}
                                onClick={() =>cb(thisArr)}
                                // onMouseEnter={() =>cb(thisArr)}
                            >
                                <input type="checkbox" checked={thisArr.filter(e => !status[e]).length === 0} readOnly />
                                <div className="item-container g-text">
                                    {item['r']}
                                    {/* <span className="first-item">{item['label']}</span>
                                    <span></span> */}
                                </div>
                            </div>
                            <div className={"person-dropdown dropdown__list-item"}
                                key={'o-'+index}
                                onClick={()=>cb([item['value']])}
                                // onMouseEnter={()=>cb([item['value']])}
                            >
                                <input type="checkbox" checked={status[item['value']]} readOnly />
                                <div className="item-container g-text">
                                    {item['label']}
                                    {/* <span className="first-item">{item['label']}</span>
                                    <span></span> */}
                                </div>
                            </div>
                            </>
                        )

                        start += 1;
                        return $ele;
                    } else {
                        return (
                            <div className={"person-dropdown dropdown__list-item"}
                                key={'o-'+index}
                                onClick={()=>cb([item['value']])}
                                // onMouseEnter={()=>cb([item['value']])}
                            >
                                <input type="checkbox" checked={status[item['value']]} readOnly />
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