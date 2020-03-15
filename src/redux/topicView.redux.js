const UPDATETOPICVIEW = 'UPDATETOPICVIEW'
const initState={
  cData:[],
  labelData:[],
  fData:[],
  relationData:[]
}
// topicView的数据管理reducer
export function topicView(state=initState,action){
  switch(action.type){
    case UPDATETOPICVIEW:
      return action.data;
    default:
      return state;
  }
}
// 操作
export function updateTopicView(data){
  return {type:UPDATETOPICVIEW,data}
}