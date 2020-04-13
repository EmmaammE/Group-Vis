

const INITDICT = 'INITDICT'

export function dict(state={},action){
  switch(action.type){
      case INITDICT:
        return action.data;
      default:
        return state;
  }
}

export function initDict(data){
  return {type:INITDICT,data}
}