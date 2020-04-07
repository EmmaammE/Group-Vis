import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setVeenedStep } from '../../actions/data';
import { Flowerbtn } from '../button/flowerbtn';
import { DimensionFisheye } from '../dimension/Dimensions';
import * as d3Fisheye from 'd3-fisheye';
import * as d3 from 'd3';

const BOX_WIDTH = 250;
const RADIUS = 100;
const OFFSET = 15;
const OUTER_RADIUS = 100;
const LENS = 50;

let fisheye = d3Fisheye.radial()
                .radius(LENS)
                .distortion(6) 
                .smoothing(0.4)

const petalPath = [
    'M0,0',
    "C40,50 50,100 0,100",
    "C-40,100 -50,50 0,0"
]

const petalPoints = (x,y)  => {
    return [
        [0+x,0+y],
        [40+x,50+y],
        [50+x,100+y],
        [0+x,100+y],
        [-40+x,100+y],
        [-50+x,50+y],
        [0+x,0+y]
    ]
}
const petalPath_ = (points = []) => {
    return  `M${points[0][0]}, ${points[0][1]} 
            C${points[1][1]},${points[1][1]} ${points[2][1]},${points[2][1]} ${points[3][1]},${points[3][1]} 
            C${points[4][1]},${points[4][1]} ${points[5][1]},${points[5][1]} ${points[6][1]},${points[6][1]} `;
    
}

// TODO 每个属性的名字（title)
/**
 * @param {Number} number: 花瓣的数量
 */
function Flower ({number, marginWidth, titles, _showUpLine, _selected, positions, _hovered, _ratio, cb, step, color='#7483a9'}) {
    const [arr, setArr] = useState([]);
    const [active, setActive] = useState(false);
    const $container = useRef(null);
    const [beenVenn, setVenn] = useState(false);
    const dispatch = useDispatch();
    const [lensPos, setLensPos] = useState([0, 0])
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

    useEffect(() => {
        // fisheye.focus([100,100])
        d3.select($container.current)
            .on('mousemove', function() {
                const mouse = d3.mouse(this);
                fisheye.focus(mouse);
                setLensPos([mouse[0], mouse[1]])
                setActive(true)
            })
            .on('mouseout', function() {
                setActive(false)
            })

    }, [])

    function toggleVeen() {
        setVenn(!beenVenn)
        updateVenn(step)
    }

    return (
        <g transform={"translate("+marginWidth+",0)"}>
            {/* { _showUpLine && 
                <path d={`M${BOX_WIDTH} 0 v40`} 
                    fill = "transparent" stroke = "black"
                    strokeWidth={_ratio} strokeDasharray = {_selected?'none':_ratio*8} />
            } */}

            <g ref={$container}>
                <g className="petals">
                    {arr.map((angle, index) => (
                        <g transform={'translate(' + [BOX_WIDTH, BOX_WIDTH-OFFSET] + ')'} key={'petal-'+index}>
                            <g transform={`rotate(${angle}) scale(1.2)`}>
                                <path 
                                    key={'petal-'+index} 
                                    d ={ 
                                        petalPath
                                        // active
                                        // ? petalPath_(petalPoints(0,0)
                                        //     .map(point => [point[0]+BOX_WIDTH, point[1]+BOX_WIDTH-OFFSET])
                                        //     .map(point => [fisheye(point)[0], fisheye(point)[1]]))
                                        // : petalPath_(petalPoints(0,0))
                                    }
                                    fill = {color}
                                    style = {{mask: "url(#mask-stripe)"}}
                                />
                                <line x1="0" y1="102" x2="0" y2="114" stroke="black" />
                            </g>
                            <text x="-40" y="0" transform={`translate(${150*Math.cos((angle+90)*Math.PI/180)},${150*Math.sin((angle+90)*Math.PI/180)})`}>
                                {titles && titles[index] && titles[index].map((text, i) => {
                                    return (<tspan 
                                        style = {{transition: 'all 100ms ease-in-out'}}
                                        x="-40" y={i*20} key={"t-"+i}
                                        fontSize = {active?fisheye([BOX_WIDTH + 150*Math.cos((angle+90)*Math.PI/180)-40, BOX_WIDTH-OFFSET+150*Math.sin((angle+90)*Math.PI/180)+i*20])[2]*12+'px':'12px'}
                                    >{text}</tspan>) }
                                )}
                                
                            </text>
                        </g>
                    ))}
                </g>
                <circle cx={BOX_WIDTH} cy={BOX_WIDTH-OFFSET} r={RADIUS} fill="white" />

                { _hovered === true &&
                    <g> 
                        <path d={`
                            M ${BOX_WIDTH},${BOX_WIDTH-OFFSET}
                            m -${OUTER_RADIUS}, 0
                            a ${OUTER_RADIUS},${OUTER_RADIUS} 0 1,1 ${OUTER_RADIUS*2},0
                            a ${OUTER_RADIUS},${OUTER_RADIUS} 0 1,1 -${OUTER_RADIUS*2},0
                            `} 
                            stroke="#f17381"
                            fill="transparent"
                            strokeWidth="2"
                        />
                        <path d={`
                            M ${BOX_WIDTH},${BOX_WIDTH-OFFSET}
                            m -${OUTER_RADIUS}, 0
                            a ${OUTER_RADIUS},${OUTER_RADIUS} 0 1,1 ${OUTER_RADIUS*2},0
                            a ${OUTER_RADIUS},${OUTER_RADIUS} 0 1,1 -${OUTER_RADIUS*2},0
                            `} 
                            stroke="#f17381"
                            fill="transparent"
                            strokeWidth="4"
                            filter="url('#dropshadow')"
                        />
                    </g>
                }
                
                <g transform="translate(200,200)">
                    <DimensionFisheye
                        fisheye={fisheye}
                        _width={80}
                        _height={80}
                        _margin = {"translate(0,0)"}
                        data={positions}
                        offset={[0,0]} 
                        active = {active}
                        cb={cb}
                    />
                </g>
            </g>

            <foreignObject x={BOX_WIDTH+180} y={BOX_WIDTH-200} width="200" height="200" >
                <Flowerbtn cb = {toggleVeen} />
            </foreignObject>


            {active && <circle stroke="black" fill="none" r={LENS} cx={lensPos[0]} cy={lensPos[1]} />}
        </g>
    )
}

export default Flower;