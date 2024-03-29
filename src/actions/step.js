import axios from '../util/http';
import { TOPIC_LRS,
        TOPICS,EDGE_DICT, 
        NODE_DICT,DICT, 
        POSITIONS, 
        TOPIC_SENTENCE_POSITION,
        TOPIC_PMI, 
        SENTENCE_DICT,
        PERSON_SENTENCE,
        TOPIC_SENTENCE_VECTOR,
        HOST_URL, 
        } from "../util/name";
import {SET_STEP, SET_GROUP, ADD_STEP, UPDATE_GROUP_DATA_BY_STEP_KEY, SET_FLOWER, REMOVE_FLOWER } from "./types";
import {updateTopicView} from '../redux/topicView.redux'
import {updateMatrix ,initPeopleCommon, peopleToList} from '../redux/matrixView.redux'
import {updateSelectList} from '../redux/selectList.redux'
import {updateTimeLine} from '../redux/timeLine.redux'
import {initTopicWeight} from '../redux/topicWeight.redux'
import {addHistoryData} from '../redux/history.redux'
import { initDict} from '../redux/dict.redux'
import {genderTemplate,
        familyTemplate,
        socialDisTemplate,
        titleTemplate,
        relationTemplate,
        locationTemplate,
        beOfficeTemplate,
        genderTemplateEn,
        familyTemplateEn,
        socialDisTemplateEn,
        titleTemplateEn,
        relationTemplateEn,
        locationTemplateEn,
        beOfficeTemplateEn,
        } from '../util/tools.js'
import { batch } from "react-redux";


//查找topic的参数
const p_populate_ratio = 0.3;
const p_max_topic = 15;
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

// 将所有主题保存到group的'flower'字段
export function setFlower(flower) {
    return {
        type: SET_FLOWER,
        data: flower
    }
}

// 清除一个主题
export function removeTopic(topicId, _step) {
    return {
        type: REMOVE_FLOWER,
        data: {
            topicId,
            _step
        }
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
            dispatch(setFlower(data[TOPICS].map(e => e['content'].join('-'))))
        })
    }
}

/**
 * 根据人群的id比较他们的topics以及数据
 *      将使用group[step]['people']生成查询的参数
 * @param {*} person_ids1 
 * @param {*} person_ids2 
 * @param {*} steps: 两个群体对应的step
 */
export function compareGroup(dispatch, KEY, person_ids1 = [], person_ids2 = [], steps = []) {
    let param = new FormData();

    for (const id of person_ids1) {
        param.append("person_ids1[]", id);
    }

    for (const id of person_ids2) {
        param.append("person_ids2[]", id);
    }

    param.append('populate_ratio', p_populate_ratio);
    param.append('max_topic', p_max_topic);
    param.append('min_sentence', p_min_sentence);

    // let param = JSON.stringify({
    //     "populate_ratio": p_populate_ratio,
    //     "max_topic": p_max_topic,
    //     "min_sentence": p_min_sentence,
    //     "person_ids1[]": person_ids1,
    //     "person_ids2[]": person_ids2,
    // })

    return dispatch => {
        axios.post('/compared_topics_by_person_ids/', param)
            .then(res => {
                // console.log(res)
                if(res['statusText'] === 'OK') {
                    let { data } = res;
                    if(data['is_success'] === true) {
                        new Promise((reslove, reject) => {
                            let fileParam = new FormData();
                            fileParam.append('file_name', data['file_name']);
                            
                            poll(fileParam, reslove, reject);

                        }).then(res => {

                            let received_json = {
                                'data': res['data'],
                                'people': [person_ids1, person_ids2]
                            }
                            console.log(received_json)
                            /** type=3 表示是传入的两个群体的数据 */
                            handleTopicRes(dispatch, received_json, KEY, steps, 3);
                        }, err => console.log(err))
                    }
                } else {
                    console.error(res)
                }
                
            })
            .catch(err => console.error(err))
        }
}

function fetchBySocket(dispatch, param, KEY, step, type) {
    // 新建WebSocket连接
    let websocket = new WebSocket("ws" + HOST_URL + "socket_search_topics_by_person_ids/");
    
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
        websocket.close();
        handleTopicRes(dispatch, received_json, KEY, step, type)
    };

    // 关闭连接后要做的事
    websocket.onclose = function () {
        console.log("连接已关闭...");
    };
}

function label2EnName(label){
    let result = []
    let start = 0
    let end = 0
    let labelArray = label.split("")
    labelArray.forEach((v,i)=>{
        if(i>0&&v>='A'&&v<='Z'){
            let temp = labelArray.slice(start,i)
            result.push(temp.join("").toLowerCase())
            start = i
        }
        end = i
    })
    let eArray = labelArray.slice(start,end+1)
    result.push(eArray.join("").toLowerCase())
    return result.join(" ")
}

function handleTopicRes(dispatch, res, KEY, step, type) {

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
            if(res.data["edge_dict"][_key][KEY]==="") {
                temp[DICT][_key] = label2EnName(res.data["edge_dict"][_key]["label"])

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
                // console.log('没有英文', _key, _data["name"])
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
        
        
        let topicLrs = res.data[TOPIC_LRS]

        // 建立从topicId 到 名称 的映射
        let topicId2Name={}

        // 翻译topic_id
        res.data[TOPICS].forEach(id => {
            let idstring = id.join(" ");
            if(topicLrs[idstring]!=undefined){
                temp[TOPICS].push([idstring, id.map(_id => (temp[DICT][_id]))]);
            }
            topicId2Name[idstring] = id.map(_id => (temp[DICT][_id])).join('-')
        }) 

        // console.log(temp[TOPICS]);
        // 记录每个topic的次数
        let count = {};
        for(let _key in res.data[TOPIC_SENTENCE_POSITION]) {
            count[_key] = Object.keys(res.data[TOPIC_SENTENCE_POSITION][_key]).length;
        }


        
        // topic的排序按照他们的比重大小来排序
        
        temp[TOPICS].sort((a,b) => topicLrs[b[0]]-topicLrs[a[0]])
        // console.log("temp[TOPIC]",JSON.stringify(temp[TOPICS]),topicLrs)
        // 下面对topic进行过滤：将其中小于4%的部分过滤掉
        // 统计原始数据weight总值是多少
        let totalWeight = Object.values(topicLrs).reduce((a,b)=>a+b,0)
        let topicNum = Object.values(topicLrs).length
        let minWeight = totalWeight*0.04
        let minIndex = 0
        let originLength = temp[TOPICS].length
        while(minIndex < originLength && topicLrs[temp[TOPICS][minIndex][0]]>minWeight){
            minIndex++
        }
        temp[TOPICS].splice(minIndex,originLength-minIndex)
        console.log("topic原始数量",topicNum,"总topic的值：",totalWeight,"topic去掉节段",minIndex,originLength)

        let people = {};
        Object.keys(res.data[POSITIONS]).forEach(id => {
            //  _positions[temp[DICT][id]] = res.data[POSITIONS][id]
            people[id] = temp[DICT][id]
            res.data[POSITIONS][id].push(temp[DICT][id]);
        })

        let peopleStatus;

        if(type === 3) {
            peopleStatus = getPeopleStatus(res['people'])
        }

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
        return updateFourViews(dispatch,people,res,temp,topicId2Name,step,addressMap,type,KEY, peopleStatus)
    } else {
        console.log(res.data.bug)
    }
}

/**
 * 求两个群体的people状态
 * @param {arr} people 
 *      [peopleids1[], peopleids2[]]
 */
function getPeopleStatus(people) {
    let peopleStatus = {};
    people[0].forEach(id => {
        // 群体1
        peopleStatus[id] = 1;
    })

    people[1].forEach(id => {
        if(peopleStatus[id] === 1) {
            //两个群体都存在
            peopleStatus[id] = 3;
        } else {
            // 群体2
            peopleStatus[id] = 2;
        }
    })

    return peopleStatus;
}

function poll(param, resolve, reject){
    let timer = setTimeout(function(){
        axios.post('/are_you_ok_by_file_name/', param)
            .then(res => {
                if(res.statusText === 'OK' && res['data']['is_success'] === true) {
                    if(res['data']['answer'] === null) {
                        clearTimeout(timer);
                        poll(param, resolve, reject);
                    } else {
                        resolve(res);
                    }
                }
            })
            .catch(err => {
                reject(err)
            })
   }, 3000);
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

    // let people = param.getAll('person_ids[]');
    // if(people.length > 200) {
    //     // 使用socket通信
    //     return dispatch => {
    //         fetchBySocket(dispatch, people, KEY, step, type)
    //     }
    // }
    // 加上其他参数
    param.append('populate_ratio', p_populate_ratio);
    param.append('max_topic', p_max_topic);
    param.append('min_sentence', p_min_sentence);

    return dispatch => {
        return new Promise(resolveP => {
            axios.post('/search_topics_by_person_ids/', param)
            .then(res => {
                // console.log(res)
                if(res['statusText'] === 'OK') {
                    let { data } = res;
                    if(data['is_success'] === true) {
                        new Promise((reslove, reject) => {
                            let fileParam = new FormData();
                            fileParam.append('file_name', data['file_name']);
                            
                            poll(fileParam, reslove, reject)
                        }).then(res => {
                            handleTopicRes(dispatch, res, KEY, step, type);
                            resolveP();
                        }, err => console.log(err))
                    }
                } else {
                    console.error(res)
                }
                
            })
            .catch(err => console.error(err))
        })
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
 * peopleStatus：用于群体对比的人的状态
 * 
*/

export function updateFourViews(dispatch,people,res,temp,topicId2Name,step, addressMap, type,KEY, peopleStatus){

    console.log("返回的数据***",res.data,"temp***",temp,addressMap,type,KEY);

    let historyData = res.data["adjust_topic_weights_params"]
    // nodeDictKey用于从id到翻译好的node的名字，注意名字有中英版，此时是已经翻译好的版本
    let nodeDictKey = []
    for(let v in res.data[NODE_DICT]){
        nodeDictKey[Number(v)] = temp[DICT][v]
    }
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
            personId:key,
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
    // pos2sentence[---上面的sentence---] = {sentenceId: {pos:[], words:""}}
    let sentence2pos = {};

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
            if(KEY === "name"){
                // 中文版本的模板
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
            }else{
                // 英文版本的模板
                switch (sentenceLabel[vKey]) {
                    case "性别":
                        senDiscription = genderTemplateEn(vKey,temp[DICT],nodeEdgeDict )
                        break;
                    case "亲属":
                        senDiscription = familyTemplateEn(vKey,temp[DICT],nodeEdgeDict )
                        break; 
                    case "社会区分":
                        senDiscription = socialDisTemplateEn(vKey,temp[DICT],nodeEdgeDict )
                        break;
                    case "官职":
                        senDiscription = titleTemplateEn(vKey,temp[DICT],nodeEdgeDict )
                        break;
                    case "关系":
                        senDiscription = relationTemplateEn(vKey,temp[DICT],nodeEdgeDict )
                        break;
                    case "地点事件":
                        senDiscription = locationTemplateEn(vKey,temp[DICT],nodeEdgeDict )
                        break;
                    case "入仕":
                        senDiscription = beOfficeTemplateEn(vKey,temp[DICT],nodeEdgeDict )
                        break;
                    default:
                        senDiscription = vKey.split(" ").map(vk=>temp[DICT][vk]).join('-')
                        break;
                }
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
                                distance:time,
                                sentenceId:vKey,
                                topicId:v[0],
                                isChoose:false,
                                category:0
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

            
            // addressMap["addressNode"]记录的是地点的映射：地点ID到地点名称
            // addressMap["addressType"]记录的是地点类型的映射
            // 提取地点事件用到地图
            let words = vKey.split(" ");
            // 一句话中可能涉及多个地点，但是只有一个类型
            let _pos = [] , _type;
            words.forEach(word => {
                if(word !== '-1') {
                    if(word in addressMap["addressNode"]) {
                        _pos.push(word);
                    } 
                    // if(word in addressMap["addressType"]) {
                    //     _type = word;
                    // }
                }
            })

            // 类型暂时都没有用到， 就去掉了
            _pos.forEach(pos => {
                if(pos2sentence[pos] === undefined) {
                    pos2sentence[pos] = [];
                }
                pos2sentence[pos].push({
                    'sentence': vKey, 
                    // 'type':  temp[DICT][_type],
                    'topic': v[0],
                    'people':sentencePersonsId
                })
            })

            if(_pos.length!==0) {
                sentence2pos[vKey] = {
                    pos: _pos,
                    words: senDiscription,
                    show: true
                }
            }
            
            let distance = topicSentence[vKey]
            cData.push({
                distance,
                discription,
                persons:[...sentencePersons],
                personsId:[...sentencePersonsId],
                time,
                isChoose:false,
                x:distance[0],
                y:distance[1],
                id:vKey,
                label:sentenceLabel[vKey],
                category:0
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
        topicData[tIndex].cData = cData
        topicData[tIndex].relationData = topicRelation
        //  占比
        topicData[tIndex].personRatio = Number((topicPerson.size/personIndex).toFixed(6))
        tIndex++
    }

    // 过滤matrixView的数据，将其中为数量为0 的人删除掉
    let mIndex = matrixPerson.length-1
    // console.log("matrixPerson",JSON.stringify(matrixPerson))
    while(mIndex>=0){
        if(matrixPerson[mIndex].number==0){
            matrixPerson.splice(mIndex,1)
            matrixData.splice(mIndex,1)
            matrixData.forEach(mData=>{
                mData.splice(mIndex,1)
            })
        }
         mIndex--
    }
    // 重新赋予新的preIndex标号
    matrixPerson.forEach((v,i)=>{
        v.preIndex = i
    })
    

    let matrixViewData = {matrixData,matrixPerson}
    let timeLineData = {tLabelData,tCircleData}
    console.log("step****右边视图的数据",topicData,timeLineData,matrixViewData,peopleToDiscriptions)

    topicData.sort((a,b)=>b.weight-a.weight)

    // 计算topicData的占比
    let _topics = [];
    for(let i=0; i <topicData.length; i++) {
        
        if(_topics.length > 8) break;

        _topics.push({
            'weight': topicData[i].weight / topicTotalWeight,
            'content': topicData[i].label.split("-"),
            'id':topicData[i].id,
            'ratio': topicData[i].personRatio
        })
    }
    
    switch (type) {
        case 3:
            // 群体对比
            //  step为一个数组, 表示对比的两个群体的step
            // 对topicData和timeLineData进行处理 
            let personMap = peopleStatus
            console.log("peopleStatus",peopleStatus)
            let addData = addCategory(personMap,topicData,timeLineData)
            timeLineData = addData.timeLineData
            topicData = addData.topicData
            console.log("addData",addData)

            updateTwoGroup(step.join('-'), { 
                "mapView": {
                    pos2sentence,
                    addressNode: addressMap['addressNode'],
                    sentence2pos
                },
                [POSITIONS]: res.data[POSITIONS],
                // 为一个对象 | 详情查看函数
                "people": peopleStatus,
                [TOPICS]: _topics,
                "selectView": {selectListData},
                "matrixView": matrixViewData,
                "timelineView": timeLineData,
                "historyData":historyData
            })(dispatch)

             // 更新降维图所需要的辅助数据 
             dispatch(addHistoryData(historyData))
             // 更新所有图
             dispatch(updateTopicView(topicData));
             dispatch(updateSelectList({selectListData}));
             dispatch(updateMatrix(matrixViewData));
             dispatch(updateTimeLine(timeLineData))
             dispatch(initPeopleCommon(peopleToDiscriptions))
             dispatch(initDict(temp[DICT]))
            break;
        case 0:
            batch(() => {
                 // 更新降维图所需要的辅助数据 
                 dispatch(addHistoryData(historyData))
                 // 更新所有图
                 dispatch(updateTopicView(topicData));
                 dispatch(updateSelectList({selectListData}));
                 dispatch(updateMatrix(matrixViewData));
                 dispatch(updateTimeLine(timeLineData))
                 dispatch(initPeopleCommon(peopleToDiscriptions))
                 dispatch(initDict(temp[DICT]))

                 dispatch(setGroup({[step]: {
                    "mapView": {
                        pos2sentence,
                        addressNode: addressMap['addressNode'],
                        sentence2pos
                    },
                    // "dict":nodeDictKey,
                    [POSITIONS]: res.data[POSITIONS],
                    [TOPICS]: _topics,
                    "people": people,
                    "topicView": topicData,
                    "selectView": {selectListData},
                    "matrixView": matrixViewData,
                    "timelineView": timeLineData,
                    "historyData":historyData
                }}))
                 dispatch(setStep(step))
                 dispatch(setFlower(_topics.map(e => e['content'].join('-'))))
            })
            break;
        case 1:
            // 更新group, step
            updateGroupAndStep(step, 
                {
                    "mapView": {
                        pos2sentence,
                        addressNode: addressMap['addressNode'],
                        sentence2pos
                    },
                    // "dict":nodeDictKey,
                    [POSITIONS]: res.data[POSITIONS],
                    [TOPICS]: _topics,
                    "people": people,
                    "topicView": topicData,
                    "selectView": {selectListData},
                    "matrixView": matrixViewData,
                    "timelineView": timeLineData,
                    "historyData":historyData
                }
            )(dispatch);
            break;
        default:
            console.log('fetch topic error')
    }
}

function updateTwoGroup(step, data) {
    return dispatch => {
        batch(() => {
            // !!! 注意，这里没有更新step。如果只监听了step的更新，需要手动dispatch相应的action
            dispatch(setGroup({[step]: data}))
            dispatch(setFlower(data[TOPICS].map(e => e['content'].join('-'))))

            // 更新降维图的step
            dispatch(setOtherStep(6, step))
            // 更新地图
            dispatch(setOtherStep(9, step))
        })
    }
}

function addCategory(personMap,topicData,timeLineData){
    // personMap，记录每个人的类别，是个对象。键是人的id，值是(1,2,3)
    // 1代表A群体。2代表B群体。3代表AB交集群体
    // 为每个描述，添加类别，0是AB类，1是A类，2是B类
    let aSum = 0
    let bSum = 0
    let abSum = 0
    for(let personId in personMap){
        if(personMap[personId]=='3'){
            abSum++
        }else if(personMap[personId]=='1'){
            aSum++
        }else{
            bSum++
        }
    }
    aSum += abSum
    bSum += abSum
    let discpMap = {}
    topicData.forEach(topic=>{
        let sumMap = {}
        let sumNum = 0
        let aMap = {}
        let aNum = 0
        let bMap = {}
        let bNum = 0
        topic.cData.forEach(v=>{
            let flagA = false
            let flagB = false
            let flagAB = false
            for(let i=0;i<v.personsId.length;i++){
                let p = v.personsId[i]
                if(personMap[p]=='3'){
                    flagAB = true 
                    if(sumMap[p]==undefined){
                        sumMap[p] = 1
                        sumNum++
                    }
                }else if(personMap[p]=='1'){
                    flagA = true
                    if(aMap[p]==undefined){
                        aMap[p] = 1
                        aNum++
                    }
                }else if(personMap[p]=='2'){
                    flagB = true
                    if(bMap[p]==undefined){
                        bMap[p] = 1
                        bNum++
                    }
                }
            }
            if(flagAB){
                v.category = 0
                discpMap[v.id] = 0
            }else{
                if(flagA&&flagB){
                    v.category = 0
                    discpMap[v.id] = 0
                }else if(flagA){
                    v.category = 1
                    discpMap[v.id] = 1
                }else{
                    v.category = 2
                    discpMap[v.id] = 2
                }
            }
        })
        let a = sumNum+aNum
        let b = sumNum+bNum
        a = aSum>0?a/aSum:0
        b = bSum>0?b/bSum:0
        topic.abRatio = [Number(a.toFixed(2)),Number(b.toFixed(2))]
        topic.personRatio = -1
    })

    timeLineData.tCircleData.forEach(personTimeLine=>{
        personTimeLine.forEach(v=>{
            if(discpMap[v.sentenceId]!=undefined){
                v.category = discpMap[v.sentenceId]
            }else{
                v.category = 0
            }

        })
    })

    // 给timeLineData.tLabelData添加类别
    timeLineData.tLabelData.forEach(v=>{
        if(personMap[v.personId]=='3'){
            v.category = 0
        }else if(personMap[v.personId]=='1'){
            v.category = 1
        }else{
            v.category = 2
        }
    })
    return {topicData,timeLineData}
}