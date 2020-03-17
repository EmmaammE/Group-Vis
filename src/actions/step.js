import axios from "axios";
import { setDict } from "../actions/data";
import { TOPICS, NODE_DICT,DICT, POSITIONS, TOPIC_SENTENCE_POSITION,TOPIC_PMI, LABEL_2_TOPIC } from "../util/name";
import {SET_STEP, SET_GROUP, ADD_STEP } from "./types";
import {updateTopicView} from '../redux/topicView.redux'
import {updateMatrix } from '../redux/matrixView.redux'
import {updateSelectList} from '../redux/selectList.redux'
import {updateTimeLine} from '../redux/timeLine.redux'

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
            
                    // 记录每个topic的次数
                    let count = {};
                    for(let _key in res.data[TOPIC_SENTENCE_POSITION]) {
                        let count_key = temp[DICT][_key]
                        temp[TOPICS].push([_key, count_key]);
                        let length = Object.keys(res.data[TOPIC_SENTENCE_POSITION][_key]).length
                        if(count[count_key] === undefined) {
                            count[count_key] = length;
                        } else {
                            count[count_key] += length;
                        }
                    }

                    temp[TOPICS].sort((a,b) => count[b[1]]-count[a[1]])
                    
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
                    // 

                    
                   console.log("返回的数据***",res.data,"temp***",temp);
                    
                   // 给topic建立从0到n的编号映射
                    let topicToIndex = {}
                    temp[TOPICS].forEach((v,i)=>{
                        topicToIndex[v[0]] = i;
                    })
                   
                    // 设置topicView所需相关数据
                    let labelData=[]
                    let cData =[]
                    let relationData=[] // topic相关性箭头数据
                    let fData = []  // 每个topic比重的数据
                    
                    let topicSentences = res.data[TOPIC_SENTENCE_POSITION]
                    let topicPmis = res.data[TOPIC_PMI]
                    let nodeDict = res.data[NODE_DICT]
                    let topicPmiExist = {}

                    // matrixView需要的数据
                    let matrixData = []
                    let matrixPerson = []
                    let personToIndex = {}
                    let personIndex = 0
                    // topic中Person的那些人
                    let persons = res.data[LABEL_2_TOPIC].Person

                    // for()

                    // selectList 需要的数据
                    let selectListData = []
                    let selectListIndex = 0

                    // timelineView需要的数据
                    let tPersonIndex = 0;
                    let tPersonToIndex={}
                    let tLabelData= []
                    let tCircleData = []

                    let tIndex = 0;
                    // 形成视图所需的数据
                    for(let v of temp[TOPICS]){
                        labelData.push(v[1])
                        cData[tIndex] = []
                        
                        fData.push({
                            label:v[1],
                            weight:0.5
                        })
                        let topicSentence = topicSentences[v[0]]
                        let isPerson = personToIndex[v[0]]!=undefined?true:false
                        // 遍历每个topic中的多个描述
                        for(let vKey in topicSentence){
                            //记录该描述中出现过的人名,
                            let sentencePersons = []
                            // 描述中出现的人名的编号
                            let disPersons = []
                            let timeNumber = 0
                            let time=0
                            let discript = vKey.split(" ").map(vk=>{
                                //一个描述片段，判断其是节点、且是人名的节点
                                if(nodeDict[vk]!=undefined&&nodeDict[vk].label=='Person'){
                                    sentencePersons.push(temp[DICT][vk])
                                    // 之前没有统计过这个人
                                    if(personToIndex[vk] == undefined){
                                        matrixPerson.push({
                                            personId:vk,
                                            name:temp[DICT][vk],
                                            number:0,
                                            preIndex:personIndex
                                        })
                                        personToIndex[vk] = personIndex
                                        matrixData[personIndex] = []
                                        personIndex++
                                    }
                                    matrixPerson[personToIndex[vk]].number++
                                    disPersons.push(personToIndex[vk])
                                }  
                                if(nodeDict[vk]!=undefined&&nodeDict[vk].label=="Year"&&temp[DICT][vk]!="0"){
                                    timeNumber++
                                    time+=Number(temp[DICT][vk])
                                }
                                return temp[DICT][vk]
                            })

                            // 统计select所需的数据
                            let discription = discript.join("-")
                            selectListData[selectListIndex++] = discription

                            // 统计出timeLineView的时间数据
                            if(timeNumber>0&&time>0){
                                time = Number(time/timeNumber).toFixed(0)
                                time = Number(time)
                                //遍历该描述中涉及到的人
                                for(let i of disPersons){
                                    // 如果该人还没有统计过
                                    if(tPersonToIndex[matrixPerson[i].personId]==undefined){
                                        tPersonToIndex[matrixPerson[i].personId] = tPersonIndex
                                        tLabelData[tPersonIndex]={
                                            name:matrixPerson[i].name,
                                            number:0,
                                            preIndex:tPersonIndex
                                        }
                                        tCircleData[tPersonIndex]=[]
                                        tPersonIndex++
                                    }
                                    let index = tPersonToIndex[matrixPerson[i].personId]
                                    tCircleData[index].push({
                                        discription,
                                        distance:time
                                    })
                                    tLabelData[index].number++    
                                }
                            }
                            
                            //该描述中出现了两个以上人,统计MatrixView所需的数据
                            // console.log("dispersons***",disPersons)
                            if(disPersons.length>1){
                                for(let i of disPersons){
                                    
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

                            let distance = topicSentence[vKey]
                            cData[tIndex].push({
                                distance,
                                discription,
                                persons:[...sentencePersons],
                                time
                            })

                        }

                        let topicPmi = topicPmis[v[0]]
                        for(let tKey in topicPmi){
                            // tkey该topic的关系没有被统计过
                            if(topicPmiExist[tKey]===undefined&&topicPmi[tKey]!=0){
                                let kIndex = topicToIndex[tKey]
                                relationData.push([Math.max(tIndex,kIndex), Math.min(tIndex,kIndex), topicPmi[tKey]])
                            }
                        }
                        // 标记该topic相关性的数据已经统计过了
                        topicPmiExist[v[0]] = 1
                        tIndex++
                    }
                    let topicData = {labelData,cData,relationData,fData}
                    let matrixViewData = {matrixData,matrixPerson}
                    let timeLineData = {tLabelData,tCircleData}

                    dispatch(updateTopicView(topicData));
                    dispatch(updateSelectList({selectListData}));
                    dispatch(updateMatrix(matrixViewData));
                    dispatch(updateTimeLine(timeLineData))
                    console.log("step****右边视图的数据",topicData,timeLineData,matrixViewData)
                } 
            })
            .catch(err => console.error(err))
    }
}