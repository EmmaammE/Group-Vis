import React from 'react';
import './selectedPanel.css'

function GroupPanel({title, startIndex, status=[], options=[], change, cb}) {
    return (
        <div className="dropdown__list-container">
            <div className="group-title">{title}</div>
            {
                options.map((item, index) => {
                    return (
                        <div className={"person-dropdown dropdown__list-item"}
                            key={'o-'+index}
                            onClick={()=>cb(index+startIndex)}
                            onMouseEnter={()=>cb(index+startIndex,change)}
                        >
                            <input type="checkbox" checked={status[index]} readOnly />
                            <div className="item-container">
                                <span className="first-item">{item['label']}</span>
                                <span>{item['r']}</span>
                            </div>
                        </div>
                    )
                })
            }
        </div>
        
    )
}

export default GroupPanel