import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setVeenedStep } from '../../actions/data';
import { Flowerbtn } from '../button/flowerbtn';
import { DimensionFisheye } from '../dimension/DimensionFisheye';
import * as d3 from 'd3';

const BOX_WIDTH = 250;
const RADIUS = 100;
const OFFSET = 15;
const OUTER_RADIUS = 100;

// 映射花瓣半径和花瓣所占比重（如百分之5等）
const size = d3.scaleSqrt()
  .domain([0, 1])
  .range([ 0, 150]);

  /**
 * flower petal path
 * @param {Number} input_angle 花瓣对应的角度
 * @param {Number} weight 当前花瓣所占的整体比值
 */
const petalPath = (input_angle, weight, proportion) => {
    let r = RADIUS;

    if(proportion!==undefined) {
        r += size(weight) * proportion
    } else {
        r += size(weight)
    }
   
    let x = r*0.5;
    let y = r*0.5;
    // let quarter = (k + RADIUS)*0.2;
    
    return "M0,0 "
        + `C${x},${y} ${x},${r} 0,${r}`
        + `C-${x},${r} -${x},${y} 0,0 Z`
};
// TODO 每个属性的名字（title)
/**
 * @param {Number} number: 花瓣的数量
 */
// function Flower({ number, current, marginWidth, titles, positions, _hovered, cb, step}) {
function Flower({ marginWidth, leaves, _selected, _hovered, positions, cb, step, current}) {
    const [arr, setArr] = useState([]);
    const [active, setActive] = useState(true);
    const $container = useRef(null);
    const [beenVenn, setVenn] = useState(false);
    const dispatch = useDispatch();
    const [lensPos, setLensPos] = useState([0, 0])
    const updateVenn = useCallback(
        step => dispatch(setVeenedStep(step)),
        [dispatch]
    )
    const [points, setPoints] = useState([])

    useEffect(() => {
        let _arr = [];
        for (let i = 0; i < leaves.length; i++) {
            _arr.push((360 / leaves.length) * i)
        }
        setArr(_arr);
    }, [leaves])

    useEffect(() => {
        d3.select($container.current)
            .on('mousemove', function () {
                const mouse = d3.mouse(this);
                setLensPos([mouse[0], mouse[1]])
                setActive(true)
            })
            .on('mouseout', function () {
                // setActive(false)
            })

    }, [current])

    function toggleVeen() {
        setVenn(!beenVenn)
        updateVenn(step)
    }

    return (
        <g transform={"translate(" + marginWidth + ",0)"}>
            <g ref={$container}>
                <g className="petals">
                    {arr.map((angle, index) => (
                        <g transform={'translate(' + [BOX_WIDTH, BOX_WIDTH - OFFSET] + ')'} key={'petal-' + index}>
                            <g transform={`rotate(${angle})`}>
                                <path
                                    d={petalPath(angle, leaves[index]['weight'])}
                                    stroke="#f0a4ae"
                                    fill="transparent"
                                />
                                <path
                                    d={petalPath(angle, leaves[index]['weight'], leaves[index]['ratio'])}
                                    fill="#f0a4ae"
                                />
                                <line x1="0" y1="102" x2="0" y2="114" stroke="black" />
                            </g>
                            <text x="0" y="0" transform={`translate(${150 * Math.cos((angle + 90) * Math.PI / 180)},${150 * Math.sin((angle + 90) * Math.PI / 180)})`}>
                                {
                                    leaves[index]['title'] && leaves[index]['title'].map((text, i) => {
                                        return (<tspan
                                            style={{ transition: 'all 100ms ease-in-out' }}
                                            x="0" y={i * 20} key={"t-" + i}
                                            fontSize="14px"
                                        >{text}</tspan>)
                                    })
                                }
                            </text>
                        </g>
                    ))}
                </g>
                <circle cx={BOX_WIDTH} cy={BOX_WIDTH - OFFSET} r={RADIUS} fill="white" opacity="1" />

                {_hovered === true &&
                    <g>
                        <path d={`
                            M ${BOX_WIDTH},${BOX_WIDTH - OFFSET}
                            m -${OUTER_RADIUS}, 0
                            a ${OUTER_RADIUS},${OUTER_RADIUS} 0 1,1 ${OUTER_RADIUS * 2},0
                            a ${OUTER_RADIUS},${OUTER_RADIUS} 0 1,1 -${OUTER_RADIUS * 2},0
                            `}
                            stroke="#f17381"
                            fill="transparent"
                            strokeWidth="2"
                        />
                        <path d={`
                            M ${BOX_WIDTH},${BOX_WIDTH - OFFSET}
                            m -${OUTER_RADIUS}, 0
                            a ${OUTER_RADIUS},${OUTER_RADIUS} 0 1,1 ${OUTER_RADIUS * 2},0
                            a ${OUTER_RADIUS},${OUTER_RADIUS} 0 1,1 -${OUTER_RADIUS * 2},0
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
                        _width={80}
                        _height={80}
                        _margin={"translate(0,0)"}
                        data={positions}
                        active={active}
                        cb={cb}
                        cb_over={setPoints}
                    />
                </g>
            </g>

            <foreignObject x={-20} y={60} width="200" height="200" >
                <Flowerbtn cb={toggleVeen} />
                <div className="flower-number"><p className="g-text">{step}</p></div>
            </foreignObject>
        </g>
    )
}

export default Flower;