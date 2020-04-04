

const UPDATEMATRIX='UPDATEMATRIX'
const initState={
  matrixData:[],
  matrixPerson:[]
}

export function matrixView(state=initState,action){
  switch(action.type){
    case UPDATEMATRIX:
      return action.data;
    default:
      return state;
  }
}

export function updateMatrix(data){
  return {type:UPDATEMATRIX,data}
}


//下面这个reducer存储两个人共同的序数集的映射，
const peopleInitState={}
const INITPEOPLECOMMON = 'INITPEOPLECOMMON'

export function peopleToList(state=peopleInitState,action){
  switch(action.type){
    case INITPEOPLECOMMON:
      return action.data;
    default:
      return state;
  }
}

export function initPeopleCommon(data){
  return {type:INITPEOPLECOMMON,data}
}


