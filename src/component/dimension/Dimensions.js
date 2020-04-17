import React, { useMemo, useRef, useEffect, useState, useCallback, } from 'react';
import * as d3Base from 'd3';
import { lasso } from 'd3-lasso';
import Tooltip from '../tooltip/tooltip';
import './lasso.css';
import { useDispatch, useSelector } from 'react-redux';
import {fetchTopicData} from '../../actions/step';
import { Flowerbtn } from '../button/flowerbtn';
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
                    let person_id = d[0];
                    let points = [scales.xScale(d[1][0]), scales.yScale(d[1][1])];
                    return (
                        <circle key={'cir-' + i} r={5}  
                            className={classCreator(person_id)}
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
    // const (btnStatus, setBtnS) = useState([false, false, false, false])
    const setSelectList = useCallback(
        (data = [] ) => dispatch(updateSelectList({selectListData: data})),[dispatch]
    )
    const _step = useSelector(state => state.step);
    const [active, setActive] = useState(false);
    const [flowerSatus, setFlowerStatus] = useState(1)
    const currentStep = useSelector(state => state.otherStep["6"])
    const topicData = useSelector(state => state.group[currentStep]["topicView"])
    const selectList = useSelector(state => state.group[currentStep]["selectView"]["selectListData"])
    const [showName, setShowName] = useState(false)

    useEffect(() => {
        const _lasso = lasso()
            .items(d3.select($container.current).selectAll('circle'))
            .targetArea(d3.select($container.current))
            .on("start", () => {
                setActive(false)

                _lasso.items()
                    .attr("fill", '#e9dac9')
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
                    .attr('fill', "#e9dac9")
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
                if(showName === true) {
                    setSelectList(_people.map(p => data[p][2]))
                }

            });

        d3.select($container.current).call(_lasso)
    }, [ _people, showName, data, setSelectList])

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
        // if(flowerSatus !== 0) {
            // 所有人
            let param = new FormData();
            let json_param = {
                "person_ids": []
            }
            Object.keys(data).forEach(_key => {
                param.append('person_ids[]', _key);
                json_param["person_ids"].push(_key)
            })
            
            // 传入调整的topic_weights
            let topic_weight = {};

            topicData.forEach(e => {
                topic_weight[e.id] = e.weight
            })
            console.log(topic_weight)
            json_param["topic_weights"] = topic_weight;
            
            axios.post('/search_all_similar_person/', JSON.stringify(json_param))
                .then(res => {
                    if(res.data.is_success) {
                        for(let _key in res.data["similiar_person"]) {
                            param.append('person_ids[]', _key);
                        }

                        fetchTopic(param, currentStep);
                        setFlowerStatus(2)

                    } else {
                        console.err(res.data.bug)
                    }
                })
                .catch( err => {
                    console.error(err)
                })
        // }
    }

    function clear() {
        _setPeople([])
        d3.select($container.current).selectAll('circle')
            .each(function() {
                this.classList.remove("selected");
            })
    }

    function people() {
        if(showName === false) {
            if(_people.length!==0) {
                // 显示已选中的人
                setSelectList(_people.map(p => data[p][2]))
            } else {
                setSelectList(Object.values(data).map(d => d[2]))
            }
            setShowName(true)
        } else {
            setSelectList(selectList);
            setShowName(false)
        }
    }

    const cbs = ['', '', clear, toFetch]

    return (
        <g>
            <g ref={$container}>
                <DimensionCircles 
                    _margin={_margin} _width={_width} _height={_height} 
                    data={data} classCreator={classCreator} 
                />
                <rect width="100%" height="100%" fill="transparent"></rect>
            </g>
            <foreignObject x="-128" y="-3px" width="160px" height="50" >
                <div className="dimension-btn-container">
                    <CircleBtn type={4} onClick={clear}></CircleBtn>
                    <CircleBtn type={5} onClick={clear}></CircleBtn>
                    <CircleBtn type={6} onClick={clear} active={true}></CircleBtn>
                    <CircleBtn type={7} onClick={toFetch} active={true}></CircleBtn>
                </div>

                {/* <div className={flowerClass(flowerSatus)}
                    onClick={onClickFlower}>
                    <div className="ball" />
                    
                    <div className="pental first"></div>
                    <div className="pental second"></div>
                </div>
                <div className="d-btn people-btn" onClick={people}>people</div> */}
            </foreignObject>
        </g>
    )
}