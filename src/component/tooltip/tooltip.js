import React from 'react';
import './tooltip.css'

export default function Tooltip({x,y,title}) {
    return (
        <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" className="hover-tip"
                style={{position: 'absolute', left:x, top:y}}> 
                {title}
            </div>
        </foreignObject>
    )
}