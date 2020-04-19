import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setVeenedStep } from '../../actions/data';
import { DimensionFisheye } from '../dimension/DimensionFisheye';
import * as d3 from 'd3';

const BOX_WIDTH = 250;
const RADIUS = 90;
const OFFSET = 15;
const OUTER_RADIUS = 90;
const COLOR = "#eba3ad";

// 映射花瓣半径和花瓣所占比重（如百分之5等）
const size = d3.scaleSqrt()
    .domain([0, 1])
    .range([0, 180]);

/**
* flower petal path
* @param {Number} number 花瓣的数量，调整花瓣的宽度
* @param {Number} weight 当前花瓣所占的整体比值
*/
const petalPath = (number, weight, proportion) => {
    let r = RADIUS, x, y;

    if (proportion !== undefined) {
        r += size(weight) * proportion
    } else {
        r += size(weight)
    }

    x = r * (0.3 + 0.05*(8-number))
    y = r * 0.5;
    // let quarter = (k + RADIUS)*0.2;

    return "M0,0 "
        + `C${x},${y} ${x},${r} 0,${r}`
        + `C-${x},${r} -${x},${y} 0,0 Z`
};

/**
 * @param {Number} type: 花朵是否展示文字
 *                    0: 展示文字； 1: 不展示
 */
// function Flower({ number, current, marginWidth, titles, positions, _hovered, cb, step}) {
function Flower({marginWidth, leaves, _hovered, positions, cb, step, current, type = 1}) {
    const [arr, setArr] = useState([]);
    const $container = useRef(null);
    const [beenVenn, setVenn] = useState(false);
    const dispatch = useDispatch();
    const updateVenn = useCallback(
        step => dispatch(setVeenedStep(step)),
        [dispatch]
    )

    useEffect(() => {
        let _arr = [];
        for (let i = 0; i < leaves.length; i++) {
            _arr.push((360 / leaves.length) * i)
        }
        setArr(_arr);
    }, [leaves])

    function toggleVeen() {
        setVenn(!beenVenn)
        updateVenn(step)
    }

    return (
        <g transform={"translate(" + marginWidth + ",0)"}>
            <g ref={$container}>
                <g className="petals" transform={'translate(' + [BOX_WIDTH, BOX_WIDTH - OFFSET] + ')'}>
                    {arr.map((angle, index) => (
                        <g key={'petal-' + index}>
                            <g transform={`rotate(${angle})`}>
                                <path
                                    d={petalPath(leaves.length, leaves[index]['weight'])}
                                    stroke={COLOR}
                                    fill="transparent"
                                />
                                <path
                                    d={petalPath(leaves.length, leaves[index]['weight'], leaves[index]['ratio'])}
                                    fill={COLOR}
                                />
                                {/* <line x1="0" y1="200" x2="0" y2="214" stroke="black" /> */}
                            </g>
                            {
                                type === 0 && 
                                <g x="0" y="0" transform={`translate(${200 * Math.cos((angle + 90) * Math.PI / 180)},${200 * Math.sin((angle + 90) * Math.PI / 180)})`}>
                                    <foreignObject x={-100 + 50 * Math.cos((angle + 90) * Math.PI / 180)} y={-25 + 25* Math.sin((angle + 90) * Math.PI / 180)} width="200" height="100">
                                        <div className="flower-title">
                                            {
                                                leaves[index]['content'] && 
                                                    leaves[index]['content'].map((text, i) => (
                                                        <p key={"title-" + i} className="g-text">{text}</p>
                                                    ))
                                            }
                                        </div>
                                    </foreignObject>
                                </g>
                            }
                        </g>
                    ))}
                </g>
                <circle cx={BOX_WIDTH} cy={BOX_WIDTH - OFFSET} r={RADIUS} fill="white" stroke={COLOR} opacity="1" />

                {_hovered === true &&
                    <g>
                        <path d={`
                            M ${BOX_WIDTH},${BOX_WIDTH - OFFSET}
                            m -${OUTER_RADIUS}, 0
                            a ${OUTER_RADIUS},${OUTER_RADIUS} 0 1,1 ${OUTER_RADIUS * 2},0
                            a ${OUTER_RADIUS},${OUTER_RADIUS} 0 1,1 -${OUTER_RADIUS * 2},0
                            `}
                            stroke="black"
                            fill="transparent"
                            strokeWidth="2"
                        />
                        <path d={`
                            M ${BOX_WIDTH},${BOX_WIDTH - OFFSET}
                            m -${OUTER_RADIUS}, 0
                            a ${OUTER_RADIUS},${OUTER_RADIUS} 0 1,1 ${OUTER_RADIUS * 2},0
                            a ${OUTER_RADIUS},${OUTER_RADIUS} 0 1,1 -${OUTER_RADIUS * 2},0
                            `}
                            stroke="#e3e3e3"
                            fill="transparent"
                            strokeWidth="2"
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
                    />
                </g>
            </g>

            <circle cx={BOX_WIDTH} cy={BOX_WIDTH-OFFSET} r={RADIUS} fill="transparent" onClick={cb} />
            <foreignObject x={-120 + type * 100} y={type * 60} width="200" height="200" >
                <div className={["flower-number", beenVenn ? 'flower-active' : ''].join(' ')} onClick={toggleVeen}>
                    <p className="g-text">{step}</p>
                </div>
            </foreignObject>

        </g>
    )
}

export default Flower;