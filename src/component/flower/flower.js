import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setVeenedStep } from '../../actions/data';
import { DimensionFisheye } from '../dimension/DimensionFisheye';
import * as d3 from 'd3';

const BOX_WIDTH = 250;
const RADIUS = 90;
const OFFSET = -10;
const OUTER_RADIUS = 90;
const COLOR = "#b4412c";

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

    let min = r * 0.2
    // x = r * 0.05 * (9-number);
    x = r * (0.2+ 0.05 * (9-number));

    if(x < min) {
        x = min;
    }
    // console.log(x)
    y = r * 0.75;
    // let quarter = (k + RADIUS)*0.2;

    return "M0,0 "
        + `C${x},${y} ${x},${r} 0,${r}`
        + `C-${x},${r} -${x},${y} 0,0 Z`
};

function getArr(leaves, topics) {
    let arr = [], index = [];

    let ownTopics = leaves.map(e => e['content'].join('-'))
    for (let i = 0; i < topics.length; i++) {
        let j = ownTopics.indexOf(topics[i]);

        if(j!==-1) {
            arr.push((360 / topics.length) * i);
            index.push(j);
        }
    }
    return {arr, index}
}
/**
 * @param {Number} type: 花朵是否展示文字
 *                    0: 展示文字； 1: 不展示
 */
function Flower({marginWidth, leaves , _hovered, positions, cb, step, current, hovercb, type = 1, venned, max}) {
    const $container = useRef(null);
    const [beenVenn, setVenn] = useState(false);
    const dispatch = useDispatch();
    const updateVenn = useCallback(
        step => dispatch(setVeenedStep(step)),
        [dispatch]
    )
    const topics = useSelector(state => Object.keys(state.group['flower']));
    // const topics = [
    // "李清照-著述关系类",
    // '毛晋'
    // '张汝舟',
    // '端木采',
    // '赵明诚',
    // '韩玉父',
    // '李格非',
    // "李清照-著述关系类-序跋文字",
    // "李清照"
// ]
    // ,"著述关系类-序跋文字",'建炎-正德-天会']

    const data = useMemo(
        () => getArr(leaves, topics),
        [topics, leaves]
    )

    function toggleVeen() {
        if(type !== 0) {
            setVenn(!beenVenn)
            updateVenn(step)
        }
    }

    return (
        <g transform={"translate(" + marginWidth + ",0)"}>
            <g ref={$container}>
            <g className="petals" transform={'translate(' + [BOX_WIDTH, BOX_WIDTH - OFFSET] + ')'}>
                    {data.arr.map((angle, index) => {
                        let current_topic = data.index[index];
                        // try {
                        //     console.log(leaves[current_topic]['weight'])
                        // } catch(err) {
                        //     console.log(leaves, topics, data.topicIndex)
                        // }
                        return <g key={'petal-' + index}>
                            <g transform={`rotate(${angle})`}>
                                <path
                                    d={petalPath(topics.length, leaves[current_topic]['weight'])}
                                    stroke={COLOR}
                                    fill="transparent"
                                    opacity='0.8'
                                    strokeWidth = "2"
                                />
                                <path
                                    d={petalPath(topics.length, 
                                        leaves[current_topic]['weight'], 
                                        leaves[current_topic]['ratio'])}
                                    fill={"#c36756"}
                                    opacity="0.8"
                                />
                                {/* <line x1="0" y1="200" x2="0" y2="214" stroke="black" /> */}
                            </g>
                            {
                                type === 0 && 
                                <text x="0" y={-leaves[current_topic]['content'].length*10} 
                                    transform={`translate(${230*Math.cos((angle+90)*Math.PI/180)},${230*Math.sin((angle+90)*Math.PI/180)})`}>
                                    {
                                        leaves[current_topic]['content'] && 
                                            leaves[current_topic]['content'].map((text, i) => (
                                                <tspan 
                                                    key={"t-"+i}
                                                    style={{fontSize: '20px'}}
                                                    className="g-text"
                                                    textAnchor="middle" 
                                                    x="0" y={i*20} 
                                                >{text}</tspan>
                                            ))
                                    }
                                </text>
                                // <g x="0" y="0" transform={`translate(${200 * Math.cos((angle + 90) * Math.PI / 180)},${200 * Math.sin((angle + 90) * Math.PI / 180)})`}>
                                    /* <foreignObject x={-100 + 50 * Math.cos((angle + 90) * Math.PI / 180)} y={-25 + 25* Math.sin((angle + 90) * Math.PI / 180)} width="200" height="100">
                                        <div className="flower-title">
                                            {
                                                leaves[current_topic]['content'] && 
                                                    leaves[current_topic]['content'].map((text, i) => (
                                                        <p key={"title-" + i} className="g-text">{text}</p>
                                                    ))
                                            }
                                        </div>
                                    </foreignObject> */

                                    
                                // </g>
                            }
                        </g>
                    })}
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

            <circle cx={BOX_WIDTH} cy={BOX_WIDTH-OFFSET} 
                style={{cursor:'pointer'}}
                r={RADIUS} fill="transparent" 
                onClick={cb} onMouseOver={hovercb} />

            <foreignObject x={max ? -20 -max*5:-120} y={type * 80} width="100%" height="200" >
                    <div className={["flower-number", beenVenn || venned ? 'flower-active' : ''].join(' ')} onClick={toggleVeen}>
                        <p 
                            style={type === 0 || max === 1 ? { 
                                fontSize: '26px',
                                width: '30px',
                                height: '30px',
                                lineHeight: '30px'
                                
                            }: {
                                fontSize:13*max+'px',
                                width: max * 15+'px',
                                height: max* 15+'px',
                                lineHeight: max *15+'px'
                            }} 
                            className="g-text">{step}</p>
                    </div>
            </foreignObject>
           
            <foreignObject x={max?290-max*15:350} y={500-90*type} width='300' height="80" >
                <p 
                    style={{ 
                        fontSize: max===1?'20px':8*max+'px',
                        textAlign: "center"
                    }}
                    className="g-text number">{"#Figures: "}  
                    <span>{Object.keys(positions).length}</span>
                </p>
            </foreignObject>
        </g>
    )
}

export default Flower;