const ADDHISTORYDATA = 'ADDHISTORYDATA'
const initState={}
// topicView的数据管理reducer
export function historyData(state=initState,action){
  switch(action.type){
    case ADDHISTORYDATA:
      return action.data;
    default:
      return state;
  }
}
// 操作
export function addHistoryData(data){
  return {type:ADDHISTORYDATA,data}
}