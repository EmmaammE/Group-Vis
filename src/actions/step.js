import axios from "axios";
import { setDict } from "../actions/data";
import { TOPICS, DICT, POSITIONS, TOPIC_SENTENCE_POSITION } from "../util/name";
import {SET_STEP, SET_GROUP, ADD_STEP } from "./types";

export function setStep(step) {
    return {
        type: SET_STEP,
        data: step
    };
}

export function addStep() {
    return {
        type: ADD_STEP,
    }
}

export function setGroup(group) {
    return {
        type: SET_GROUP,
        data: group
    };
}

export function setOtherStep(key, step) {
    console.log(key + "_SET_STEP");
    return {
        type: key + "_SET_STEP",
        data: step
    }
}

export function fetchTopicData(param, KEY, step) {
    return dispatch => {
        axios.post('/search_topics_by_person_ids/', param)
            .then(res => {
                if(res.data.is_success) {
                    // 处理node_dict and edge_dict, 将name修改一下
                    let temp = {[DICT]:{}, [TOPICS]:[]}
            
                    for(let _key in res.data["node_dict"]) {
                        let _data = res.data["node_dict"][_key]
                        if(_data["name"] === "None" && _data["en_name"] === "None") {
                            temp[DICT][_key] =  _data["label"]
                        } else if(_data[KEY] === "None") {
                            temp[DICT][_key] = _data["name"]
                        } else {
                            temp[DICT][_key] = _data[KEY]
                        }
                    }
            
                    for(let _key in res.data["edge_dict"]) {
                        // 中文： edge的name 英文: edge的label
                        if(res.data["edge_dict"]==="") {
                            temp[DICT][_key] = res.data["edge_dict"][_key]["label"]
                        } else {
                            temp[DICT][_key] = res.data["edge_dict"][_key][KEY]
                        }
                    }
            
                    let count = {};
                    for(let _key in res.data[TOPIC_SENTENCE_POSITION]) {
                        let count_key = temp[DICT][_key]
                        temp[TOPICS].push([_key, count_key]);
            
                        if(count[count_key] === undefined) {
                            count[count_key] = 1;
                        } else {
                            count[count_key] += 1;
                        }
                    }
                    temp[TOPICS].sort((a,b) => count[b]-count[a])
                    
                    
                    // 这里请求topic,设置相关的数据,分发不同的action
                    // 分发node和edge的映射
                    dispatch(setDict(temp[DICT]));
                    // 分发Overview更新需要的数据
                    dispatch(setGroup({[step]: {
                        // person_id []
                        'people': Object.keys(res.data[POSITIONS]),
                        [TOPIC_SENTENCE_POSITION]: res.data[TOPIC_SENTENCE_POSITION],
                        [POSITIONS]: res.data[POSITIONS],
                        [TOPICS]: temp[TOPICS]
                    }}))
                    dispatch(addStep())
                    //  一些数据说明, 不用了可删掉
                    //         DICT(name.js) ：node_edge的dict
                    //         "label2topic_ids": res.data["label2topic_ids"],
                    //         "topic_id2sentence_id2position1d": res.data["topic_id2sentence_id2position1d"],
                    //         "topic_pmi": res.data["topic_pmi"],
                    //         "person_id2position2d": res.data["person_id2position2d"]
                } 
            })
            .catch(err => console.error(err))
    }
}