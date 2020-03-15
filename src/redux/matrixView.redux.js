

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
