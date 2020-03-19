import React, { useMemo } from 'react';
import * as d3 from 'd3';
import Tooltip from '../tooltip/tooltip';
import { useState } from 'react';

const getScales = (width, height, data) => {
    let dataArr = Object.entries(data)

    let xScale = d3.scaleLinear().range([0, width])
        .domain(d3.extent(dataArr, d => d[1][0]));
    let yScale = d3.scaleLinear().range([0, height])
        .domain(d3.extent(dataArr, d => d[1][1]));

    // console.log(xScale.domain(), yScale.domain());
    return {xScale, yScale,dataArr}
}

function Dimension({_width, _height, _margin, data = {}, type = 0}) {
    const scales = useMemo(() => getScales(_width, _height, data), [_width, _height, data]);
    const [tooltip, setTooltip] = useState({x:0, y:0, title: ''});
    const [show, setShow] = useState(false);

    function showTooltip(i,e) {
        setShow(true)
        setTooltip({
            x: e.nativeEvent.offsetX + 65*type,
            y: e.nativeEvent.offsetY + 65*type,
            title: scales.dataArr[i][0]
        })
    }

    function toggleShow() {
        setShow(false);
    }

    return ( 
        <>
        {show && <Tooltip {...tooltip} />}
        <g transform={_margin}>
            {
                scales.dataArr.map((d,i)=> {
                    return (
                        <circle key={'cir-'+i} r={3} fill="#efeff6" stroke="#bec0db" strokeWidth="1px"
                            // opacity = {0.4}
                            style = {{cursor: 'pointer'}}
                            onMouseOver = {(e)=>showTooltip(i,e)}
                            onMouseOut = {toggleShow}
                            cx={scales.xScale(d[1][0])} cy={scales.yScale(d[1][1])} />
                    )
                })
            }
        </g>
        </>
    )
}

export default Dimension;