import axios from "axios";
import { TOPIC_LRS,
        TOPICS,EDGE_DICT, 
        NODE_DICT,DICT, 
        POSITIONS, 
        TOPIC_SENTENCE_POSITION,
        TOPIC_PMI, 
        SENTENCE_DICT,
        PERSON_SENTENCE,
        TOPIC_SENTENCE_VECTOR, 
        } from "../util/name";
import {SET_STEP, SET_GROUP, ADD_STEP, UPDATE_GROUP_DATA_BY_STEP_KEY } from "./types";
import {updateTopicView} from '../redux/topicView.redux'
import {updateMatrix ,initPeopleCommon, peopleToList} from '../redux/matrixView.redux'
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
import { batch } from "react-redux";

//查找topic的参数
const p_populate_ratio = 0.6;
const p_max_topic = 10;
const p_min_sentence = 5;

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

function updateGroupAndStep(step, data) {
    return dispatch => {
        batch(() => {
            // console.log(step);
            // 分发Overview更新需要的数据
            dispatch(setGroup({[step]: data}))
            dispatch(setStep(step))
        })
    }
}

function fetchBySocket(dispatch, param, KEY, step, type) {
    // 新建WebSocket连接
    let websocket = new WebSocket("ws://localhost:8080/socket_search_topics_by_person_ids/");
    
    // 连接打开事件，打开连接后发送数据
    websocket.onopen = function () {
        // 使用send()方法发送数据
        let p = JSON.stringify({
            'person_ids[]': param,
            "populate_ratio": p_populate_ratio,
            "max_topic": p_max_topic,
            "min_sentence": p_min_sentence
        })
        websocket.send(p);
    };

    // 接收数据事件，event的data就是返回数据
    websocket.onmessage = function (evt) {
        let received_json = {
            "data": JSON.parse(evt.data)
        };
        // console.log(received_json)
        handleTopicRes(dispatch, received_json, KEY, step, type)
        websocket.close();

    };

    // 关闭连接后要做的事
    websocket.onclose = function () {
        console.log("连接已关闭...");
    };
}

function handleTopicRes(dispatch, res, KEY, step, type) {
    console.log(Object.keys(res.data))

    if(res.data["is_success"]) {
        // 存储label是Addr的节点的id
        let addressNode = {};
        let addressType = {};
        // 处理node_dict and edge_dict, 将name修改一下
        // KEY是区别中英文的代表
        let temp = {[DICT]:{}, [TOPICS]:[]}
        // temp[DICT]中记录着从topic编号到topic名字的映射,以及从描述编号到描述文字的映射
        for(let _key in res.data["edge_dict"]) {
            // 中文： edge的name 英文: edge的label
            if(res.data["edge_dict"]==="") {
                temp[DICT][_key] = res.data["edge_dict"][_key]["label"]
            } else {
                temp[DICT][_key] = res.data["edge_dict"][_key][KEY]
            }
        }
        
        for(let _key in res.data["node_dict"]) {
            let _data = res.data["node_dict"][_key]
            if(_data["name"] === "None" && _data["en_name"] === "None") {
                temp[DICT][_key] =  _data["label"]
            } else if(_data[KEY] === "None") {
                temp[DICT][_key] = _data["name"]
            } else {
                temp[DICT][_key] = _data[KEY]
            }

            if(_data["label"] === "Addr") {
                addressNode[_key] = _data[KEY]
            }
            if(_data["label"] === "AddrType") {
                addressType[_key] = _data[KEY]
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

        // console.log(temp[TOPICS]);
        // 记录每个topic的次数
        let count = {};
        for(let _key in res.data[TOPIC_SENTENCE_POSITION]) {
            count[_key] = Object.keys(res.data[TOPIC_SENTENCE_POSITION][_key]).length;
        }


        let topicLrs = res.data[TOPIC_LRS]
        // topic的排序按照他们的比重大小来排序
        temp[TOPICS].sort((a,b) => topicLrs[b[0]]-topicLrs[a[0]])
        // 下面对topic进行过滤：将其中小于4%的部分过滤掉
        // 统计原始数据weight总值是多少
        let totalWeight = Object.values(topicLrs).reduce((a,b)=>a+b,0)
        let topicNum = Object.values(topicLrs).length
        let minWeight = totalWeight/topicNum*0.2
        let minIndex = 0
        let originLength = temp[TOPICS].length
        while(minIndex < originLength && topicLrs[temp[TOPICS][minIndex][0]]>minWeight){
            minIndex++
        }
        temp[TOPICS].splice(minIndex,originLength-minIndex)
        console.log("topic原始数量",topicNum,"总topic的值：",totalWeight,"topic去掉节段",minIndex,originLength)


        // 地图查询的人
        let people = {};
        let _positions = {};
        Object.keys(res.data[POSITIONS]).forEach(id => {
            //  _positions[temp[DICT][id]] = res.data[POSITIONS][id]
            people[id] = temp[DICT][id]
            res.data[POSITIONS][id].push(temp[DICT][id]);
            _positions[id] = res.data[POSITIONS][id];
        })

        let addressMap = {
            addressNode,
            addressType
        }
        
        //  接口数据说明
        //         DICT(name.js) ：node_edge的dict
        //         "label2topic_ids": res.data["label2topic_ids"],
        //         "topic_id2sentence_id2position1d": res.data["topic_id2sentence_id2position1d"],
        //         "topic_pmi": res.data["topic_pmi"],
        //         "person_id2position2d": res.data["person_id2position2d"]
        // 
        updateFourViews(dispatch,people,res,temp,topicId2Name,step,_positions,addressMap,type)
    } else {
        console.log(res.data.bug)
    }
}
/**
 * 
 * @param {*} param 请求topicd的参数 formData
 * @param {*} KEY 中英文 state.KEY
 * @param {*} step 将要设置的step  !!!(current +1 )
 * @param {*} type 
 *              0：点击Search：更新所有视图的数据
 *              1：点击Flower：更新topic|XXX-view数据
 */
export function fetchTopicData(param, KEY, step, type) {

    let people = param.getAll('person_ids[]');
    if(people.length > 400) {
        // 使用socket通信
        return dispatch => {
            fetchBySocket(dispatch, people, KEY, step, type)
        }
    }
    // 加上其他参数
    param.append('populate_ratio', p_populate_ratio);
    param.append('max_topic', p_max_topic);
    param.append('min_sentence', p_min_sentence);

    return dispatch => {
        axios.post('/search_topics_by_person_ids/', param)
            .then(res => {
                handleTopicRes(dispatch, res, KEY, step, type)
            })
            .catch(err => console.error(err))
        }
}

/*
 *
 * @dispatch是函数
 * @people是 res.data["person_id2position2d"] 中涉及的人的数据，是从id到人名的映射
 * @res是后端请求来的数据
 * @temp是前面建立的字典数据
 * @topicId2Name，是对象，是从topic的id到其名字的映射
 * 其中dispatch和res、temp应该是必须的。
 * people/topicId2Name，可以由其它数据合成
 * 
*/

export function updateFourViews(dispatch,people,res,temp,topicId2Name,step, _positions, addressMap, type){

    console.log("返回的数据***",res.data,"temp***",temp);
    

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


    // 给topic建立从0到n的编号映射
    let topicToIndex = {}
    temp[TOPICS].forEach((v,i)=>{
        topicToIndex[v[0]] = i;
    })
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

    // 建立由两个人，找到他们共同的描述的映射集合
    // 两个人的描述可能有很多个，所以对应的是个数组
    let peopleToDiscriptions = {}

    // selectList 需要的数据
    let selectListData = []
    let selectListIndex = 0

    let tIndex = 0;
    // 形成视图所需的数据
    let topicData = []
    let topicTotalWeight = 0

    // 地点和对应事件描述的映射
    // pos2sentence[pos] = [ {sentence: Number, type: 'string', topic: 'vKey'} ]
    let pos2sentence = {};
    // 描述包含的事件
    // pos2sentence[---上面的sentence---] = [pos, pos...]
    let sentence2pos = [];

    for(let v of temp[TOPICS]){

        // 将比重为0的数据过滤掉
        if(topicLrs[v[0]]==0){
            continue
        }
        let topicName = topicId2Name[v[0]]
        // labelData.push(topicName)
        let cData = []
        
        topicTotalWeight += topicLrs[v[0]]

        topicData.push({
            id:v[0],
            label:topicName,
            weight:topicLrs[v[0]]
        })


        // 记录topic中涉及到的人数，占总人数的比例，用来绘制雪糕图
        let topicPerson = new Set()
        // 下是关于该topic的所有描述是对象。
        let topicSentence = topicSentences[v[0]]
        let isPerson = personToIndex[v[0]]!=undefined?true:false
        // 遍历每个topic中的多个描述
        for(let vKey in topicSentence){
            //记录该描述中出现过的人名
            let sentencePersons = []
            let sentencePersonsId = []
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

            // 提取地点事件用到地图
            let words = vKey.split(" ");
            let _pos = [] , _type;
            words.forEach(word => {
                if(word !== '-1') {
                    if(word in addressMap["addressNode"]) {
                        _pos.push(word);
                    } 
                    if(word in addressMap["addressType"]) {
                        _type = word;
                    }
                }
            })

            _pos.forEach(pos => {
                if(pos2sentence[pos] === undefined) {
                    pos2sentence[pos] = [];
                }
                pos2sentence[pos].push({
                    'sentence': sentence2pos.length, 
                    'type':  temp[DICT][_type],
                    'topic': v
                })
            })

            if(_pos.length!==0) {
                sentence2pos.push({
                    pos: _pos,
                    words: senDiscription
                })
            }

            
            let discript = vKey.split(" ").map(vk=>{
                //一个描述的单一片段，如果其是我们要搜索的人的话
                if(personToIndex[vk]!=undefined&&singleExist[vk]==undefined){
                    disPersons.push(personToIndex[vk])
                    // 标志这个描述中，该人已经被统计过了
                    singleExist[vk]=1
                    sentencePersons.push(people[vk])
                    sentencePersonsId.push(vk)
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
            
            if(disPersons.length>1){
                for(let i of disPersons){
                    matrixPerson[i].number++
                    for(let j of disPersons){
                        if(i<j){
                            let name = []
                            name.push( matrixPerson[i].name)
                            // 采用i比j小的记录方式
                            name.push( matrixPerson[j].name)
                            let joinName = name.sort((a,b)=>{
                                return b.localeCompare(a)
                            }).join('-')
                            if(matrixData[i][j]==undefined){
                                matrixData[i][j]=1
                                peopleToDiscriptions[joinName]=[]
                            }else{
                               matrixData[i][j]+=1 
                            }
                            peopleToDiscriptions[joinName].push(senDiscription)
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
                personsId:[...sentencePersonsId],
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
    console.log("step****右边视图的数据",topicData,timeLineData,matrixViewData,peopleToDiscriptions)

    topicData.sort((a,b)=>b.weight-a.weight)
    // topicData.forEach(v=>{
    //     // 按比例调整每个topic的weight，使其总和为100
    //     // 其实不该修改weight值
    //     v.weight = Number((v.weight/topicTotalWeight*100).toFixed(2))
    // })
    let historyData = {
        [TOPIC_SENTENCE_VECTOR]:res.data[TOPIC_SENTENCE_VECTOR],
        [PERSON_SENTENCE]:res.data[PERSON_SENTENCE]
    }
    // 更新group, step
    updateGroupAndStep(step, 
        {
            "mapView": {
                pos2sentence,
                addressNode: addressMap['addressNode'],
                sentence2pos
            },
            [POSITIONS]: _positions,
            [TOPICS]: temp[TOPICS],
            "people": people,
            "topicView": topicData,
            "selectView": {selectListData},
            "matrixView": matrixViewData,
            "timelineView": timeLineData,
            "historyData":historyData
        }
    )(dispatch)

    if(type === 0) {
        // 更新降维图所需要的辅助数据 
        dispatch(addHistoryData(historyData))
        // 更新所有图
        // let sliderWeights = topicData.map(v=>v.weight)
        // dispatch(initTopicWeight(sliderWeights))
        dispatch(updateTopicView(topicData));
        dispatch(updateSelectList({selectListData}));
        dispatch(updateMatrix(matrixViewData));
        dispatch(updateTimeLine(timeLineData))
        dispatch(initPeopleCommon(peopleToDiscriptions))
    }
}