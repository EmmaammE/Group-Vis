import React from 'react';
import { DimensionCircles } from "./Dimensions";

export function DimensionFisheye({_width, _height, _margin, data = {}}) {

    return (
        <g>
            <DimensionCircles
                _margin={_margin} _width={_width} _height={_height} data={data} 
            />
        </g>
    )
}