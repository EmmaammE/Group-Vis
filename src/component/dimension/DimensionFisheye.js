import React, {useEffect, useState, useRef } from 'react';
import {select, mouse, transition} from 'd3';
import { DimensionCircles } from "./Dimensions";

const d3 = Object.assign({select, mouse, transition});

export function DimensionFisheye({_width, _height, _margin, cb, cb_over, data = {}, offset=[]}) {
    const [points, setPoints] = useState([
        [4.1444637896854095, 77.34338328906053],
        [28.465473961078093, 32],
        [27.825506293292438, 31.999999999999975],
        [4.144463789685243, 1.7136387023584598],
        [4.144463789685449, 16.94297800858115],
        [70.63781418828667, 32.00000000000007],
        [70.6378141882867, 31.999999999999908],
    ])
    const $container = useRef(null);
    const $mask = useRef(null);
    const $overview = useRef(null);


    useEffect(() => {
        d3.select($mask.current)
        .on('mousemove', function() {
            let arr = [];
            d3.select($container.current).selectAll('.circles')
                .each(function(e,i) {
                    let $node = d3.select(this)
                    let p = [Number($node.attr("cx")), Number($node.attr("cy"))]
                    arr.push(p)
                })

            cb_over(arr)
        })
        .on('mouseout', function() {
            const mouse = d3.mouse(this);
            if((mouse[0] >150 || mouse[0]< -50) 
                && (mouse[1] < -70 || mouse[1]> 130)
            ) {
                cb_over([])

                // if(points.length!==0) {
                //     d3.select($container.current).selectAll('.circles')
                //     .transition(d3.easeCubic)
                //     .duration(50)
                //     .attr('cx',(e,i)=>points[i][0])
                //     .attr('cy',(e,i)=>points[i][1])
                //     .attr('r',3)
                // }
            }
        })
    }, [$container, cb_over, $mask])

    return (
        <g ref={$container}>
            <DimensionCircles
                _margin={_margin} _width={_width} _height={_height} data={data} 
            />

            <circle ref={$mask} r="100" cx="50" cy="35" fill="transparent" 
                onClick={cb}
            />
        </g>
    )
}