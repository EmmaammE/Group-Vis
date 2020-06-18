import React, { useMemo, useRef, useEffect, useState, useCallback, } from 'react';
import * as d3Base from 'd3';
import { lasso } from 'd3-lasso';
import Tooltip from '../tooltip/tooltip';
import './lasso.css';
import { useDispatch, useSelector } from 'react-redux';
import {fetchTopicData} from '../../actions/step';
import axios from '../../util/http';
import CircleBtn from '../button/circlebtn';
import { DimensionCircles } from './Dimensions';
import { setPerson } from '../../actions/data'

const d3 = Object.assign(d3Base, { lasso });

export function DimensionFilter({ _width, _height, _margin, peopleStatus, selectedPeople = {}, data = {}, cb}) {

    const $container = useRef(null);
    // 当前视图使用lasso选中的人
    const [_people, _setPeople] = useState([]);
    const dispatch = useDispatch();
    const KEY = useSelector(state => state.KEY)
    const fetchTopic = useCallback(
      (param, step) => dispatch(fetchTopicData(param, KEY, step+1, 1)),
      [dispatch, KEY]
    )
    const setPersonCB = useCallback(
        people => dispatch(setPerson(people)), [dispatch]
    )
    const _step = useSelector(state => state.step);
    const currentStep = useSelector(state => state.otherStep["6"])
    const topicData = useSelector(state => state.group[currentStep]["topicView"])

    const [nextParam, setNextParam] = useState({})

    useEffect(() => {
        const _lasso = lasso()
            .items(d3.select($container.current).selectAll('circle'))
            .targetArea(d3.select($container.current))
            .on("start", () => {
                _lasso.items()
                    .each(function() {
                        this.classList.remove("topic-selected");
                    })
                setPersonCB({})
            })
            .on("end", () => {
                // Style the selected dots
                _lasso.selectedItems()
                    .each(function() {
                        if(this.classList.contains("selected")) {
                            this.classList.remove("selected");
                            _people.splice(_people.indexOf(this.getAttribute("data")),1);
                        } else {
                            this.classList.add("selected");
                            let da = this.getAttribute("data");
                            if(da!==null) {
                                _people.push(this.getAttribute("data"))
                            }
                        }
                    })
                
                _setPeople(_people);
                cb(_people.map(p => data[p][2]))
            });

        d3.select($container.current).call(_lasso)
    }, [ _people, data, cb, setPersonCB])

    useEffect(() => {
        _setPeople([]);
        cb(Object.values(data).map(d => d[2]))
    }, [data, cb])

    useEffect(() => {
        if(Object.keys(selectedPeople).length !== 0) {
            let people = [];
            for(let key in selectedPeople) {
                if(data[key] && data[key][2]) {
                    people.push(data[key][2])
                }
            }
            cb(people)

            d3.select($container.current).selectAll('circle')
                .each(function() {
                    this.classList.remove("selected");
                })
        }
    }, [selectedPeople, data, cb])

    function toFetch() {
        let param = new FormData();

        if(Object.keys(selectedPeople).length !== 0) {
            Object.keys(selectedPeople).forEach(id => {
                param.append('person_ids[]', id);
            })
        } else {
            _people.forEach(_key => {
                param.append('person_ids[]', _key);
            })
        }
        fetchTopic(param, _step);
       
        _setPeople([]);
        setPersonCB({})
        d3.select($container.current).selectAll('circle')
            .each(function() {
                this.classList.remove("selected");
                this.classList.remove("topic-selected")
            })
    }

    async function fetchSimiliarPerson() {
       
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
        // console.log(topic_weight)
        json_param["topic_weights"] = topic_weight;
        
        try {
            let res = await axios.post('/search_all_similar_person/', JSON.stringify(json_param))

            if(res.data.is_success) {
                // 对相似的人
                let similiarParam = new FormData();
                let flag = 0;
                for(let _key in res.data["similar_person"]) {
                    param.append('person_ids[]', _key);
                    similiarParam.append('person_ids[]', _key);
                    flag++
                    if(flag === 20) {
                        break;
                    }
                }
    
                if(flag === 0) {
                    alert('没有相似人')
                } else {
                    try {
                        fetchTopic(similiarParam, _step);
                        // 查询出的相似的人的step将要被设置为step+1
                        sessionStorage.setItem('similiar', _step+1)
                        // 查询的是currentStep的
                        sessionStorage.setItem('similiar_origin', currentStep)
                        setNextParam(param)
                    } catch(err) {
                        console.error(err)
                    }
                }
            } else {
                console.err(res.data.bug)
            }
        } catch(err) {
            console.error(err)
        }
    }

    useEffect(() => {
        let similiar = sessionStorage.getItem('similiar');
        if(similiar!== null && +similiar === _step) {
            if(nextParam instanceof FormData) {
                try {
                    fetchTopic(nextParam, _step);
                } catch(err) {
                    sessionStorage.removeItem('similiar');
                    sessionStorage.removeItem('similiar_origin');
                    console.error(err)
                }
            }
        }
    }, [_step, fetchTopic, nextParam])

    function clear() {
        _setPeople([])
        cb(Object.values(data).map(d => d[2]))
        
        d3.select($container.current).selectAll('circle')
            .each(function() {
                this.classList.remove("selected");
                this.classList.remove("topic-selected")
            })
    }

    function classCreator(person_id) {
        if(selectedPeople[person_id]) {
            return 'topic-selected'
        }
    }

    return (
        <div>
            <div className="brush-btn-container">
                <CircleBtn type={4}></CircleBtn>
                <CircleBtn type={5}></CircleBtn>
                <CircleBtn type={6} onClick={clear} active={true}></CircleBtn>
                <CircleBtn type={8} onClick={toFetch} active={true}></CircleBtn>
                <div className="similar-btn">
                    <CircleBtn type={9} onClick={fetchSimiliarPerson} active={true}></CircleBtn>
                </div>
            </div>
            <div className="dimension-svg">
            {
                data && <svg viewBox={"0 0 340 340"} width="100%" height="100%">
                    <g ref={$container}>
                        <DimensionCircles 
                            _margin={_margin} _width={_width} _height={_height} 
                            data={data} status = {peopleStatus}
                            classCreator={classCreator} 
                        />
                        <rect 
                            style = {{ cursor: 'pointer'}}
                            width="100%" height="100%" fill="transparent"></rect>
                    </g>
                </svg>
            }
            </div>
        </div>
    )
}