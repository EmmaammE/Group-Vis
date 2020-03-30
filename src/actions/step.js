import axios from "axios";
import { setDict } from "../actions/data";
import { TOPIC_LRS,
        TOPICS,EDGE_DICT, 
        NODE_DICT,DICT, 
        POSITIONS, 
        TOPIC_SENTENCE_POSITION,
        TOPIC_PMI, 
        SENTENCE_DICT,
        PERSON_SENTENCE,
        TOPIC_SENTENCE_VECTOR } from "../util/name";
import {SET_STEP, SET_GROUP, ADD_STEP, UPDATE_GROUP_DATA_BY_STEP_KEY } from "./types";
import {updateTopicView} from '../redux/topicView.redux'
import {updateMatrix } from '../redux/matrixView.redux'
import {updateSelectList} from '../redux/selectList.redux'
import {updateTimeLine} from '../redux/timeLine.redux'
import {initTopicWeight} from '../redux/topicWeight.redux'
import {addHistoryData} from '../redux/history.redux'
import {genderTemplate,
        familyTemplate,
        socialDisTemplate,
        titleTemplate,
        relationTemplate,
        locationTemplate,
        beOfficeTemplate,
        } from '../util/tools.js'

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
    // console.log(key + "_SET_STEP");
    return {
        type: key + "_SET_STEP",
        data: step
    }
}

export function updateGroupdata(key, step, data) {
    return {
        type: UPDATE_GROUP_DATA_BY_STEP_KEY,
        data: {
            step, key, data
        }
    }
}

export function fetchTopicData(param, KEY, step) {
    return dispatch => {
        axios.post('/search_topics_by_person_ids/', param)
            .then(res => {
                if(res.data.is_success) {
                    // 处理node_dict and edge_dict, 将name修改一下
                    // KEY是区别中英文的代表
                    let temp = {[DICT]:{}, [TOPICS]:[]}
                    // temp[DICT]中记录着从topic编号到topic名字的映射,以及从描述编号到描述文字的映射
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
                    
                    // 
                    for(let _key in res.data["edge_dict"]) {
                        // 中文： edge的name 英文: edge的label
                        if(res.data["edge_dict"]==="") {
                            temp[DICT][_key] = res.data["edge_dict"][_key]["label"]
                        } else {
                            temp[DICT][_key] = res.data["edge_dict"][_key][KEY]
                        }
                    }
            
                    // 建立从topicId 到 名称 的映射
                    let topicId2Name={}

                    // 翻译topic_id
                    res.data[TOPICS].forEach(id => {
                        let idstring = id.join(" ");
                        temp[TOPICS].push([idstring, id.map(_id => (temp[DICT][_id]))]);
                        topicId2Name[idstring] = id.map(_id => (temp[DICT][_id])).join('-')
                    }) 
                    console.log(temp[TOPICS]);
                    // 记录每个topic的次数
                    let count = {};
                    for(let _key in res.data[TOPIC_SENTENCE_POSITION]) {
                        count[_key] = Object.keys(res.data[TOPIC_SENTENCE_POSITION][_key]).length;
                    }

                    // topic的排序按照他们的描述数量来排序
                    temp[TOPICS].sort((a,b) => count[b[0]]-count[a[0]])
                    
                    // 地图查询的人
                    let people = {};
                    let _positions = {};
                    Object.keys(res.data[POSITIONS]).forEach(id => {
                        //  _positions[temp[DICT][id]] = res.data[POSITIONS][id]
                        people[id] = temp[DICT][id]
                        res.data[POSITIONS][id].push(id);
                        _positions[temp[DICT][id]] = res.data[POSITIONS][id];
                    })
                    // console.log(people, _positions);
                    // 这里请求topic,设置相关的数据,分发不同的action
                    // 分发node和edge的映射
                    dispatch(setDict(temp[DICT]));
                    // 分发Overview更新需要的数据
                    dispatch(setGroup({[step]: {
                        'people': people,
                        [TOPIC_SENTENCE_POSITION]: res.data[TOPIC_SENTENCE_POSITION],
                        [POSITIONS]: _positions,
                        [TOPICS]: temp[TOPICS]
                    }}))
                    dispatch(addStep())
                    //  一些数据说明, 不用了可删掉
                    //         DICT(name.js) ：node_edge的dict
                    //         "label2topic_ids": res.data["label2topic_ids"],
                    //         "topic_id2sentence_id2position1d": res.data["topic_id2sentence_id2position1d"],
                    //         "topic_pmi": res.data["topic_pmi"],
                    //         "person_id2position2d": res.data["person_id2position2d"]
                    // 

                    // 更新降维图所需要的辅助数据
                    dispatch(addHistoryData({
                        [TOPIC_SENTENCE_VECTOR]:res.data[TOPIC_SENTENCE_VECTOR],
                        [PERSON_SENTENCE]:res.data[PERSON_SENTENCE]
                    }))

                   console.log("返回的数据***",res.data,"temp***",temp);
                    
                   // 给topic建立从0到n的编号映射
                    let topicToIndex = {}
                    temp[TOPICS].forEach((v,i)=>{
                        topicToIndex[v[0]] = i;
                    })

                    // 描述类别字典
                    let topicSentences = res.data[TOPIC_SENTENCE_POSITION]
                    let topicPmis = res.data[TOPIC_PMI]
                    // topic的比重
                    let topicLrs = res.data[TOPIC_LRS]
                    let sentenceLabel = res.data[SENTENCE_DICT]
                    let nodeDict = res.data[NODE_DICT]
                    let nodeEdgeDict = {
                        ...res.data[NODE_DICT],
                        ...res.data[EDGE_DICT]
                    }

                    // people建立了从id到人名的映射，
                    // matrixView需要的数据

                    let matrixData = []
                    let matrixPerson = []
                    let personToIndex = {}
                    let personIndex = 0

                    // timelineView需要的数据
                    let tPersonToIndex={}
                    let tLabelData= []
                    let tCircleData = []
                    //  该人是否已经收集了相应的描述
                    let tTopicExist = []

                    // matrixView中只需要展示需要搜索的人即可
                    for(let key in people){
                        matrixPerson.push({
                            personId:key,
                            name:people[key],
                            number:0,
                            preIndex:personIndex
                        })
                        
                        personToIndex[key] = personIndex
                        matrixData[personIndex] = []
                        tLabelData.push({
                            name:people[key],
                            number:0,
                            preIndex:personIndex
                        })
                        tPersonToIndex[key] = personIndex
                        tCircleData[personIndex] = []

                        tTopicExist[personIndex] = {}
                        personIndex++
                    }

                    

                    // selectList 需要的数据
                    let selectListData = []
                    let selectListIndex = 0

                    let tIndex = 0;
                    // 形成视图所需的数据
                    let topicData = []
                    for(let v of temp[TOPICS]){

                        // 将比重为0的数据过滤掉
                        if(topicLrs[v[0]]==0){
                            continue
                        }
                        let topicName = topicId2Name[v[0]]
                        // labelData.push(topicName)
                        let cData = []
                        
                        topicData.push({
                            id:v[0],
                            label:topicName,
                            weight:topicLrs[v[0]]
                        })

                        let topicPerson = new Set()
                        // 下是关于该topic的所有描述是对象。
                        let topicSentence = topicSentences[v[0]]
                        let isPerson = personToIndex[v[0]]!=undefined?true:false
                        // 遍历每个topic中的多个描述
                        for(let vKey in topicSentence){
                            //记录该描述中出现过的人名
                            let sentencePersons = []
                            let singleExist ={}
                            // 描述中出现的人名的编号
                            let disPersons = []
                            let timeNumber = 0
                            let time=0
                            let senDiscription
                            switch (sentenceLabel[vKey]) {
                                case "性别":
                                    senDiscription = genderTemplate(vKey,temp[DICT],nodeEdgeDict )
                                    break;
                                case "亲属":
                                    senDiscription = familyTemplate(vKey,temp[DICT],nodeEdgeDict )
                                    break;
                                case "社会区分":
                                    senDiscription = socialDisTemplate(vKey,temp[DICT],nodeEdgeDict )
                                    break;
                                case "官职":
                                    senDiscription = titleTemplate(vKey,temp[DICT],nodeEdgeDict )
                                    break;
                                case "关系":
                                    senDiscription = relationTemplate(vKey,temp[DICT],nodeEdgeDict )
                                    break;
                                case "地点事件":
                                    senDiscription = locationTemplate(vKey,temp[DICT],nodeEdgeDict )
                                    break;
                                case "入仕":
                                    senDiscription = beOfficeTemplate(vKey,temp[DICT],nodeEdgeDict )
                                    break;
                                default:
                                    senDiscription = vKey.split(" ").map(vk=>temp[DICT][vk]).join('-')
                                    break;
                            }

                            let discript = vKey.split(" ").map(vk=>{
                                //一个描述的单一片段，如果其是我们要搜索的人的话
                                if(personToIndex[vk]!=undefined&&singleExist[vk]==undefined){
                                    disPersons.push(personToIndex[vk])
                                    // 标志这个描述中，该人已经被统计过了
                                    singleExist[vk]=1
                                    sentencePersons.push(people[vk])
                                }  
                                if(nodeDict[vk]!=undefined&&nodeDict[vk].label=="Year"&&Number(temp[DICT][vk])>1){
                                    timeNumber++
                                    time+=Number(temp[DICT][vk])
                                }
                                return temp[DICT][vk]
                            })

                            // 统计select所需的数据
                            // let discription = discript.join("-")
                            let discription = senDiscription
                            selectListData[selectListIndex++] = discription

                            // 统计出timeLineView的时间数据
                            if(timeNumber>0&&time>10){
                                time = Number(time/timeNumber).toFixed(0)
                                time = Number(time)
                                //遍历该描述中涉及到的人
                                if(time>10){
                                    for(let i of disPersons){
                                        //该人从来没有统计过该描述
                                        if(tTopicExist[i][discription]==undefined){
                                            tLabelData[i].number++
                                            tCircleData[i].push({
                                                discription,
                                                distance:time
                                            }) 
                                        }
                                          
                                    }
                                }
                            }
                            
                            //该描述中出现了两个以上人,统计MatrixView所需的数据
                            // console.log("dispersons***",disPersons)
                            if(disPersons.length>1){
                                for(let i of disPersons){
                                    matrixPerson[i].number++
                                    for(let j of disPersons){
                                        // 采用i比j小的记录方式
                                        if(i<j){
                                            if(matrixData[i][j]==undefined){
                                                matrixData[i][j]=1
                                            }else{
                                               matrixData[i][j]+=1 
                                            }
                                        }
                                    }
                                }
                            }

                            disPersons.forEach(v=>{
                                topicPerson.add(v)
                            })
                            
                            let distance = topicSentence[vKey]
                            cData.push({
                                distance,
                                discription,
                                persons:[...sentencePersons],
                                time,
                                isChoose:false,
                                x:distance[0],
                                y:distance[1]
                            })
                        }

                        let topicRelation= []
                        let topicPmi = topicPmis[v[0]]
                        let pmiIndex = 0
                        for(let tKey in topicPmi){
                            // tkey该topic的关系没有被统计过
                            topicRelation.push({
                                id:tKey,
                                name:topicId2Name[tKey],
                                pmi:topicPmi[tKey],
                                index:pmiIndex
                            })
                            pmiIndex++
                        }
                        //  标记该topic相关性的数据已经统计过了
                        topicData[tIndex].cData = cData
                        topicData[tIndex].relationData = topicRelation
                        //  占比
                        topicData[tIndex].personRatio = Number((topicPerson.size/personIndex).toFixed(6))
                        tIndex++
                    }
                    // let topicData = {labelData,cData,relationData,fData}
                    let matrixViewData = {matrixData,matrixPerson}
                    let timeLineData = {tLabelData,tCircleData}
                    console.log("step****右边视图的数据",topicData,timeLineData,matrixViewData)
                    topicData.sort((a,b)=>b.weight-a.weight)
                    let sliderWeights = topicData.map(v=>v.weight)
                    dispatch(initTopicWeight(sliderWeights))
                    dispatch(updateTopicView(topicData));
                    dispatch(updateSelectList({selectListData}));
                    dispatch(updateMatrix(matrixViewData));
                    dispatch(updateTimeLine(timeLineData))
                    
                } 
            })
            .catch(err => console.error(err))
    }
}


export function updateFlower(param, KEY, step) {
    // 只更新图2的数据
    return dispatch => {
        axios.post('/search_topics_by_person_ids/', param)
            .then(res => {
                if(res.data.is_success) {
                    // 处理node_dict and edge_dict, 将name修改一下
                    // KEY是区别中英文的代表
                    let temp = {[DICT]:{}, [TOPICS]:[]}
                    // temp[DICT]中记录着从topic编号到topic名字的映射,以及从描述编号到描述文字的映射
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
            
                    // 翻译topic_id
                    res.data[TOPICS].forEach(id => {
                        let idstring = id.join(" ");
                        temp[TOPICS].push([idstring, id.map(_id => (temp[DICT][_id]))]);
                    })
                    console.log(temp[TOPICS]);
                    // 记录每个topic的次数
                    let count = {};
                    for(let _key in res.data[TOPIC_SENTENCE_POSITION]) {
                        count[_key] = Object.keys(res.data[TOPIC_SENTENCE_POSITION][_key]).length;
                    }

                    temp[TOPICS].sort((a,b) => count[b[0]]-count[a[0]])
                    
                     // 地图查询的人
                     let people = {};
                     Object.keys(res.data[POSITIONS]).forEach(id => {
                         people[id] = temp[DICT][id]
                     })
                     
                     let _positions = {};
                     Object.keys(res.data[POSITIONS]).forEach(id => {
                        res.data[POSITIONS][id].push(id);
                        _positions[id] = res.data[POSITIONS][id];
                     })

                    // 分发Overview更新需要的数据
                    dispatch(setGroup({[step+1]: {
                        // person_id []
                        'people': people,
                        [TOPIC_SENTENCE_POSITION]: res.data[TOPIC_SENTENCE_POSITION],
                        [POSITIONS]: _positions,
                        [TOPICS]: temp[TOPICS]
                    }}))
                    dispatch(addStep())
                } 
            })
            .catch(err => console.error(err))
    }   
}