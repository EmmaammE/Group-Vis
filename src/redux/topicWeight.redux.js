import axios from '../util/http';
import { updateGroupdata } from "../actions/step";
import { POSITIONS } from "../util/name";
const INITTOPICWEIGHT = 'INITOPICWEIGHT'
const UPDATETOPICWEIGHT = 'UPDATETOPICWEIGHT'
const initState=[]

export function topicWeight(state=initState,action){
  switch(action.type){
    case INITTOPICWEIGHT:
      return action.data;
    case UPDATETOPICWEIGHT:
      const index = action.data.index
      // let newState = state
      state[index] = action.data.weight
      return [...state]
    default:
      return state;
  }
}

export function updateTopicWeight(data){
  return {type:UPDATETOPICWEIGHT,data}
}

export function initTopicWeight(data){
  return {type:INITTOPICWEIGHT,data}
}

// 更新topic的weight值，将值发给后端，获取新的数据
export function updateTopicLrs(param, KEY, step){
  return dispatch=>{
    console.log("updateTopicLrs",param,KEY,step)
    axios.post('/adjust_topic_weights/',param)
      .then(res=>{
        if(res.data.is_success){
          // console.log("updateTopicLrs",res.data)
          // 返回数据：person_id2position2d
          // 返回的数据：person_dict
          // 更新降维图的数据.....
          // console.log("返回的数据",res.data)
          Object.keys(res.data[POSITIONS])
            .forEach(id => {
              res.data[POSITIONS][id].push(res.data["person_dict"][id][KEY]);
            })

          dispatch(updateGroupdata(POSITIONS, step, res.data[POSITIONS]))
        }
      })
  }
}


// export function 