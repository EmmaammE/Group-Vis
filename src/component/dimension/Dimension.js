import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import * as d3Base from 'd3';
import './lasso.css';
import { lasso } from 'd3-lasso';
import Tooltip from '../tooltip/tooltip';
import { useDispatch, useSelector } from 'react-redux';
import {fetchTopicData} from '../../actions/step';

const d3 = Object.assign(d3Base, { lasso });

const getScales = (width, height, data) => {
    let dataArr = Object.entries(data)

    let xScale = d3.scaleLinear().range([0, width])
        .domain(d3.extent(dataArr, d => d[1][0]));
    let yScale = d3.scaleLinear().range([0, height])
        .domain(d3.extent(dataArr, d => d[1][1]));

    return { xScale, yScale, dataArr }
}

function Dimension({ _width, _height, _margin, selectedPeople = [], data = {}, type = 0 }) {
    const $container = useRef(null);
    const $rect = useRef(null);
    const scales = useMemo(() => getScales(_width, _height, data), [_width, _height, data]);
    const [tooltip, setTooltip] = useState({ x: 0, y: 0, title: '' });
    const [show, setShow] = useState(false);
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

    function showTooltip(i, e) {
        setShow(true)
        setTooltip({
            x: e.nativeEvent.offsetX + 65 * type,
            y: e.nativeEvent.offsetY + 65 * type,
            title: scales.dataArr[i][0]
        })
    }

    function toggleShow() {
        setShow(false);
    }

    useEffect(() => {
        if (type === 0) {
            console.log();
            const _lasso = lasso()
                .items(d3.select($container.current).selectAll('circle'))
                .targetArea(d3.select($container.current))
                .on("start", () => {
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
        }
    }, [type, _people])


    useEffect(() => {
        _setSelected({});
        _setPeople([]);
    }, [data])

    function toFetch() {
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

    return (
        <>
            {show && <Tooltip {...tooltip} />}
            {type === 0 && <rect width='20' height="10" fill="#f00" onClick={toFetch } />}
            <g transform={_margin} ref={$container}>
                {
                    scales.dataArr.map((d, i) => {
                        let person_id = d[1][2];
                        return (
                            <circle key={'cir-' + i} r={3}  stroke="#bec0db" strokeWidth="1px"
                                // opacity = {0.4}
                                data={person_id}
                                fill={"#efeff6"}
                                className={[_selected[person_id]?"been-selected":'', selectedPeople[person_id]?'topic-selected':''].join(" ")}
                                style={{ cursor: 'pointer' }}
                                onMouseOver={(e) => showTooltip(i, e)}
                                onMouseOut={toggleShow}
                                cx={scales.xScale(d[1][0])} cy={scales.yScale(d[1][1])} />
                        )
                    })
                }
                <rect ref={$rect} width="340" height="300" style={{ opacity: 0 }} />
            </g>
        </>
    )
}

export default Dimension;