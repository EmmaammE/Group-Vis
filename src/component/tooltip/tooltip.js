import React from 'react';
import './tooltip.css'

export default function Tooltip({ x, y, title, content }) {
    return (
        <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" className="tooltip-box"
                style={{ position: 'absolute', left: x, top: y }}>
                <div className="tooltip-head"
                    style={{fontSize: '24px', minHeight:'30px', 'overflow':'visible'}}
                >{title}</div>
                <div className="tooltip-content">
                    {
                        content.map((d, i) => {
                            return <div
                                key={"t-" + i}
                                style={{fontSize: '20px'}}
                            >{d}</div>
                        })
                    }
                </div>
            </div>
        </foreignObject>
    )
}