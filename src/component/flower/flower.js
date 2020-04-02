import React, { useEffect, useState, useCallback } from 'react';
import Dimension from '../dimension/Dimension';
import { useDispatch } from 'react-redux';
import { setVeenedStep } from '../../actions/data';

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
function Flower ({number, marginWidth, titles, _showUpLine, _selected, positions, _hovered, _ratio, cb, step, color='#7483a9'}) {
    const [arr, setArr] = useState([]);
    const [beenVenn, setVenn] = useState(false);
    const dispatch = useDispatch();
    const updateVenn = useCallback(
        step => dispatch(setVeenedStep(step)),
        [dispatch]
      )

    useEffect(() => {
        let _arr = [];
        for (let i = 0; i < number; i++) {
            _arr.push((360/number) * i)         
        }
        setArr(_arr);
    }, [number])

    function toggleVeen() {
        setVenn(!beenVenn)
        updateVenn(step)
    }

    return (
        <g transform={"translate("+marginWidth+",0)"}>
            { _showUpLine && 
                <path d={`M${BOX_WIDTH} 0 v40`} 
                    fill = "transparent" stroke = "black"
                    strokeWidth={_ratio} strokeDasharray = {_selected?'none':_ratio*8} />
            }
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
                            {titles && titles[index] && titles[index].map((text, i) =>
                                (<tspan x="-40" y={i*20} key={"t-"+i}>{text}</tspan>)
                            )}
                        </text>
                    </g>
                ))}
            </g>
            <circle cx={BOX_WIDTH} cy={BOX_WIDTH-OFFSET} r={RADIUS} fill="white" />
            
            <Dimension
                _width={60}
                _height={60}
                _margin = {"translate(220,220)"}
                data={positions}
                type = {1}
            />
            <circle cx={BOX_WIDTH} cy={BOX_WIDTH-OFFSET} r={RADIUS} fill="transparent" onClick={cb} />

            <circle cx={BOX_WIDTH+200} cy={BOX_WIDTH-200} r={10} fill="black" onClick={toggleVeen} />
        </g>
    )
}

export default Flower;