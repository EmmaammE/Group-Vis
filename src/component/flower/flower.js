import React, { useEffect, useState } from 'react';

const BOX_WIDTH = 250;
const RADIUS = 100;
const OFFSET = 15;
const OUTER_RADIUS = 195;
const INNER_RADIUS = 190;

const petalPath = [
    'M0,0',
    "C40,50 50,100 0,100",
    "C-40,100 -50,50 0,0"
]

// TODO 每个属性的名字（title)
/**
 * @param {Number} number: 花瓣的数量
 */
function Flower ({number, marginWidth, titles, _showUpLine, _selected, _hovered, _ratio, color='#7483a9'}) {
    const [arr, setArr] = useState([]);

    useEffect(() => {
        let _arr = [];
        for (let i = 0; i < number; i++) {
            _arr.push((360/number) * i)         
        }
        setArr(_arr);
    }, [number])

    return (
        <g transform={"translate("+marginWidth+",0)"}>
            { _showUpLine && <path d={`M${BOX_WIDTH} 0 v40}`} 
               fill = "transparent" stroke = "black"
               strokeWidth={_ratio} strokeDasharray = {_selected?'none':_ratio*8} />}
            { _hovered === true &&
                <g> 
                    <path d={`M ${BOX_WIDTH},${BOX_WIDTH-OFFSET} m0,-${OUTER_RADIUS} a ${OUTER_RADIUS},${OUTER_RADIUS},0,1,0,1,0 Z
                            m 0 ${OUTER_RADIUS-INNER_RADIUS} a ${INNER_RADIUS}, ${INNER_RADIUS},0,1,1,-1,0 Z`} fill="#f17381" />
                    <path d={`M ${BOX_WIDTH},${BOX_WIDTH-OFFSET} m0,-${OUTER_RADIUS} a ${OUTER_RADIUS},${OUTER_RADIUS},0,1,0,1,0 Z
                            m 0 ${OUTER_RADIUS-INNER_RADIUS} a ${INNER_RADIUS}, ${INNER_RADIUS},0,1,1,-1,0 Z`} 
                            fill="#f17381" filter="url('#dropshadow')"/>
                </g>
            }
            <g className="petals">
                {arr.map((angle, index) => (
                    <g transform={'translate(' + [BOX_WIDTH, BOX_WIDTH-OFFSET] + ')'} key={'petal-'+index}>
                        <g transform={`rotate(${angle}) scale(1.2)`}>
                            <path 
                                key={'petal-'+index} 
                                d ={petalPath}
                                fill = {color}
                                style = {{mask: "url(#mask-stripe)"}}
                            />
                            <line x1="0" y1="102" x2="0" y2="114" stroke="black" />
                        </g>
                        <text x="-40" y="0" transform={`translate(${150*Math.cos((angle+90)*Math.PI/180)},${150*Math.sin((angle+90)*Math.PI/180)})`}>
                            {titles && titles[index]}
                        </text>
                    </g>
                ))}
            </g>
            <circle cx={BOX_WIDTH} cy={BOX_WIDTH-OFFSET} r={RADIUS} fill="white" />
        </g>
    )
}

export default Flower;