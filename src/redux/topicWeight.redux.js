const INITTOPICWEIGHT = 'INITOPICWEIGHT'
const UPDATETOPICWEIGHT = 'UPDATETOPICWEIGHT'
const initState={
}

export function topicWeight(state=initState,action){
  switch(action.type){
    case INITTOPICWEIGHT:
      return action.data;
    case UPDATETOPICWEIGHT:
      const index = action.data.index
      state[index].weight = action.data.weight
      return {...state}
    default:
      return state;
  }
}

export function updateTopicWeight(data){
  return {type:UPDATETOPICWEIGHT,data}
}

export function initTopicWeight(data){
  return {type:UPDATETOPICWEIGHT,data}
}

// export function 