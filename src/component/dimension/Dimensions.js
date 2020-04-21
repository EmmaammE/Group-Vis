import React, { useMemo, useRef, useEffect, useState, useCallback, } from 'react';
import * as d3Base from 'd3';
import { lasso } from 'd3-lasso';
import Tooltip from '../tooltip/tooltip';
import './lasso.css';
import { useDispatch, useSelector } from 'react-redux';
import {fetchTopicData} from '../../actions/step';
import axios from 'axios';
import { updateSelectList } from '../../redux/selectList.redux';
import CircleBtn from '../button/circlebtn';


const d3 = Object.assign(d3Base, { lasso });

const getScales = (width, height, data) => {
    let dataArr = Object.entries(data)

    let xScale = d3.scaleLinear().range([0, width])
        .domain(d3.extent(dataArr, d => d[1][0])).nice();
    let yScale = d3.scaleLinear().range([0, height])
        .domain(d3.extent(dataArr, d => d[1][1])).nice();

    return { xScale, yScale, dataArr }
}

const _class = () => 'circles';

const color = (status) => {
    if(status === undefined || status === 3) {
        return '#e9dac9'
    } else {
        return ['#00bcd4', '#85a392'][status]
    }
}
const getPeopleStatus = (people) => {
    if(people === undefined) {
        return undefined
    }
    let peopleStatus = {};
    people[0].forEach(id => {
        peopleStatus[id] = 1;
    })

    people[1].forEach(id => {
        if(peopleStatus[id] === 1) {
            peopleStatus[id] = 3;
        } else {
            peopleStatus[id] = 2;
        }
    })

    return peopleStatus;
}

// 返回降维图的点点
export function DimensionCircles({_width, _height, data, _margin, status}) {
    const scales = useMemo(() => getScales(_width, _height, data), [_width, _height, data]);
    const [tooltip, setTooltip] = useState({ x: 0, y: 0, title: '' });
    const [show, setShow] = useState(false);

    function showTooltip(i, e) {
        setShow(true)
        setTooltip({
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
            title: scales.dataArr[i][0]
        })
    }

    function toggleShow() {
        setShow(false);
    }

    if(status === undefined ) {
        return (
            <g transform={_margin}>
                {/* {show && <Tooltip {...tooltip} />} */}
                {
                    scales.dataArr.map((d, i) => {
                        let person_id = d[0];
                        let points = [scales.xScale(d[1][0]), scales.yScale(d[1][1])];
                        return (
                            <circle key={'cir-' + i} r={5}  
                                // className={classCreator(person_id)}
                                strokeWidth="1px"
                                stroke="#e9dac9"
                                opacity = {0.5}
                                fill={"#e9dac9"}
                                data={person_id}
                                style={{ cursor: 'pointer' }}
                                cx={points[0]} 
                                cy={points[1]} 
                                onMouseOver={(e) => showTooltip(i, e)}
                                onMouseOut={toggleShow} />
                        )
                    })
                }
            </g>
        )
    } else {
        return (
            <g transform={_margin}>
                {
                    scales.dataArr.map((d, i) => {
                        let person_id = d[0];
                        let points = [scales.xScale(d[1][0]), scales.yScale(d[1][1])];
                        return (
                            <circle key={'cir-' + i} r={5}  
                                // className={classCreator(person_id)}
                                strokeWidth="1px"
                                stroke="#e9dac9"
                                opacity = {0.5}
                                fill={color(status[person_id])}
                                data={person_id}
                                style={{ cursor: 'pointer' }}
                                cx={points[0]} 
                                cy={points[1]} 
                                onMouseOver={(e) => showTooltip(i, e)}
                                onMouseOut={toggleShow} />
                        )
                    })
                }
            </g>
        )
    }
    
}