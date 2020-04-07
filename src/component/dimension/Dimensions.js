import React, { useMemo, useRef, useEffect, useState, useCallback, createRef } from 'react';
import * as d3Base from 'd3';
import { lasso } from 'd3-lasso';
import Tooltip from '../tooltip/tooltip';
import './lasso.css';
import { useDispatch, useSelector } from 'react-redux';
import {fetchTopicData} from '../../actions/step';
import { Flowerbtn } from '../button/flowerbtn';
import axios from 'axios';

const d3 = Object.assign(d3Base, { lasso });

const getScales = (width, height, data) => {
    let dataArr = Object.entries(data)

    let xScale = d3.scaleLinear().range([0, width])
        .domain(d3.extent(dataArr, d => d[1][0]));
    let yScale = d3.scaleLinear().range([0, height])
        .domain(d3.extent(dataArr, d => d[1][1]));

    return { xScale, yScale, dataArr }
}

const _class = () => 'circles';

const flowerClass = (status) => {
    switch (status) {
        case 0:
            // 没有相似的人，不能点击
            return 'btn-add cannot-click'
        case 1:
            // 可以点击， 未点击
            return 'btn-add'
        case 2:
            // 已点击
            return 'btn-add active'
        default:
            break;
    }
}

// 返回降维图的点点
export function DimensionCircles({_width, _height, data, _margin, classCreator=_class}) {
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

    return (
        <g 
        transform={_margin}
        >
            {/* {show && <Tooltip {...tooltip} />} */}
            {
                scales.dataArr.map((d, i) => {
                    let person_id = d[1][2];
                    let points = [scales.xScale(d[1][0]), scales.yScale(d[1][1])];
                    return (
                        <circle key={'cir-' + i} r={3}  
                            className={classCreator(person_id)}
                            stroke="#bec0db"
                            strokeWidth="1px"
                            opacity = {0.8}
                            fill={"#efeff6"}
                            data={person_id}
                            style={{ cursor: 'pointer' }}
                            cx={points[0]} 
                            cy={points[1]} 
                            datax={points[0]} 
                            datay={points[1]} 
                            onMouseOver={(e) => showTooltip(i, e)}
                            onMouseOut={toggleShow} />
                    )
                })
            }
        </g>
    )
}

export function DimensionFilter({ _width, _height, _margin, selectedPeople = [], data = {}}) {

    const $container = useRef(null);
    // 选中的人
    const [_people, _setPeople] = useState([]);
    // 已选中的人
    const [_selected, _setSelected] = useState({});
    const dispatch = useDispatch();
    const KEY = useSelector(state => state.KEY)
    const fetchTopic = useCallback(
      (param, step) => dispatch(fetchTopicData(param, KEY, step+1, 1)),
      [dispatch, KEY]
    )
    const _step = useSelector(state => state.step);
    const [active, setActive] = useState(false);
    const [flowerSatus, setFlowerStatus] = useState(0)

    useEffect(() => {
        const _lasso = lasso()
            .items(d3.select($container.current).selectAll('circle'))
            .targetArea(d3.select($container.current))
            .on("start", () => {
                setActive(false)

                _lasso.items()
                    .attr("fill", '#efefef')
            })
            .on("draw", () => {

                // Style the possible dots
                _lasso.possibleItems()
                    .classed("not_possible", false)
                    .classed("possible", true);

                // Style the not possible dot
                _lasso.notPossibleItems()
                    .classed("not_possible", true)
                    .classed("possible", false);
            })
            .on("end", () => {
                // Reset the color of all dots
                _lasso.items()
                    .attr('fill', "#efeff6")
                    .classed("not_possible", false)
                    .classed("possible", false);

                // Style the selected dots
                _lasso.selectedItems()
                    .each(function() {
                        if(this.classList.contains("selected")) {
                            this.classList.remove("selected");
                            _people.splice(_people.indexOf(this.getAttribute("data")),1);
                        } else {
                            this.classList.add("selected");
                            _people.push(this.getAttribute("data"))
                        }
                    })
                
                _setPeople(_people);

            });

        d3.select($container.current).call(_lasso)
    }, [ _people])

    useEffect(() => {
        _setSelected({});
        _setPeople([]);
    }, [data])

    function classCreator(person_id) {
        if(_selected[person_id]) {
            return "been_selected"
        }
        if(selectedPeople[person_id]) {
            return 'topic-selected'
        }
    }

    function toFetch() {
        setActive(true)
        let param = new FormData();
        let _temp  = {};
        _people.forEach(_key => {
            param.append('person_ids[]', _key);
            _temp[_key] = true
        })
        fetchTopic(param, _step);

        // 之前选中的人
        _setSelected({..._selected, ..._temp});
        _setPeople([]);
    }

    function onClickFlower() {
        if(flowerSatus !== 0) {
            // 已经框选的人
            let param = new FormData();
            _people.forEach(_key => {
                param.append('person_ids[]', _key);
            })
            
            let next_param = Object.assign(param)
            // 传入调整的topic_weights

            
            axios.post('/search_all_similar_person/')
                .then(res => {
                    if(res.data.is_success) {
                        for(let _key in res.data["similiar_person"]) {
                            next_param.append('person_ids[]', _key);
                        }

                        fetchTopic(param, KEY, _step);
                        setFlowerStatus(2)

                    } else {
                        console.err(res.data.bug)
                    }
                })
                .catch( err => {
                    console.err(err)
                })
        }
    }

    return (
        <g>
            <g ref={$container}>
                <DimensionCircles 
                    _margin={_margin} _width={_width} _height={_height} 
                    data={data} classCreator={classCreator} 
                />
                <rect width="100%" height="100%" fill="transparent"></rect>
            </g>
            <foreignObject x="10" y="-3px" width="100" height="50" >
                <div className={flowerClass(flowerSatus)}
                    onClick={onClickFlower}>
                    <div className="ball" />
                    
                    <div className="pental first"></div>
                    <div className="pental second"></div>
                </div>
                <Flowerbtn cb = {toFetch} active={active} />
            </foreignObject>
        </g>
    )
}

export function DimensionFisheye({fisheye, _width, _height, _margin, cb, data = {}, offset=[]}) {
    const [points, setPoints] = useState([])
    const $container = createRef(null);
    const $mask = createRef(null);


    useEffect(() => {
        d3.select($mask.current)
            .on('mousemove', function() {
                const mouse = d3.mouse(this);
                fisheye.focus(mouse)

                if(points.length === 0) {
                    let arr = [];
                    d3.select($container.current).selectAll('.circles')
                        .each(function(e,i) {
                            let $node = d3.select(this)
                            let p = [Number($node.attr("datax")+offset[0]), Number($node.attr("datay"))+offset[1]]
                            arr.push(p)
                        })
                        .transition()
                        .duration(100)
                        .attr('cx',(e,i)=>{
                            return fisheye(arr[i])[0]-offset[0]
                        })
                        .attr('cy',(e,i)=> fisheye(arr[i])[1]-offset[1])
                        .attr('r' ,(e,i) => fisheye(arr[i])[2]*2)
                    setPoints(arr)
                } else {
                    d3.select($container.current).selectAll('.circles')
                        .transition(d3.easeCubic)
                        .duration(100)
                        .attr('cx',(e,i)=>fisheye(points[i])[0])
                        .attr('cy',(e,i)=>fisheye(points[i])[1])
                        .attr('r' ,(e,i) => fisheye(points[i])[2]*2)
                }
                
            })
            .on('mouseout', function() {
                const mouse = d3.mouse(this);
                if((mouse[0] >150 || mouse[0]< -50) 
                    && (mouse[1] < -70 || mouse[1]> 130)
                ) {
                    if(points.length!==0) {
                        d3.select($container.current).selectAll('.circles')
                        .transition(d3.easeCubic)
                        .duration(200)
                        .attr('cx',(e,i)=>points[i][0])
                        .attr('cy',(e,i)=>points[i][1])
                        .attr('r' ,2)
                    }
                }
                
            })
            

    }, [fisheye, $container, points, offset,$mask])

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