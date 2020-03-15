
const UPDATESELECTLIST='UPDATESELECTLIST'
const initState={
  selectListData:[]
}

export function selectListView(state=initState,action){
  switch(action.type){
    case UPDATESELECTLIST:
      return action.data;
    default:
      return state;
  }
}

export function updateSelectList(data){
  return {type:UPDATESELECTLIST,data}
}
