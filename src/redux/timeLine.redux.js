const UPDATETIMELINE='UPDATETIMELINE'
const initState={
  tLabelData :[],
  tCircleData:[]
}

export function timeLineView(state=initState,action){
  switch(action.type){
    case UPDATETIMELINE:
      return action.data;
    default:
      return state;
  }
}

export function updateTimeLine(data){
  return {type:UPDATETIMELINE,data}
}