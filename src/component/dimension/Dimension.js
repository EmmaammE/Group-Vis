import React, { useMemo } from 'react';
import * as d3 from 'd3'

const getScales = (width, height, data) => {
    let xScale = d3.scaleLinear().range([0, width])
        .domain(d3.extent(data, d => d[0]));
    let yScale = d3.scaleLinear().range([0, height])
        .domain(d3.extent(data, d => d[1]));

    // console.log(xScale.domain(), yScale.domain());
    return {xScale, yScale}
}

function Dimension({_width, _height, _margin, data = {}}) {
    const scales = useMemo(() => getScales(_width, _height, data), [_width, _height, data]);

    return ( 
        <g transform={_margin}>
            {
                data.map((d,i)=> {
                    return (
                        <circle key={'cir-'+i} r={3} fill="#efeff6" stroke="#bec0db" strokeWidth="1px"
                            opacity = {0.4}
                            cx={scales.xScale(d[0])} cy={scales.yScale(d[1])} />
                    )
                })
            }
        </g>
    )
}

export default Dimension;