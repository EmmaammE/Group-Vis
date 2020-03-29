import axios from "axios";
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

// 更新topic的weight值，将值发现后端，获取新的数据
export function updateTopicLrs(param, KEY, step){
  console.log("updateTopicLrs----",KEY, step)
  return dispatch=>{
    axios.post('/adjust_topic_weights/',param)
      .then(res=>{
        console.log("res.data----",res.data)
        if(res.data.is_success){
          console.log("updateTopicLrs",res.data)
          let _positions = {};
          Object.keys(res.data[POSITIONS])
            .forEach(id => {
              res.data[POSITIONS][id].push(id);
              _positions[res.data["person_dict"][id][KEY]] = res.data[POSITIONS][id];
            })
          dispatch(updateGroupdata(POSITIONS, step, _positions))
        }
      })
  }
}



// export function 