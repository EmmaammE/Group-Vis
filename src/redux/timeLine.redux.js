const UPDATETIMELINE='UPDATETIMELINE'
const initState={

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