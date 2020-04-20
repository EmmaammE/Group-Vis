import {SET_STEP, ADD_STEP, SET_GROUP, UPDATE_GROUP_DATA_BY_STEP_KEY, SET_FLOWER } from "../actions/types";
import {deepClone} from '../util/tools'
export function step(state=0, action) {
    switch (action.type) {
        case SET_STEP:
            state = action.data
            return state;
        case ADD_STEP:
            return state + 1;
        default:
            return state;
    }
}

/**
 * group: 历史数据
 *  {   
 *      step: data
 *      'flower': 所有的花瓣
 *  }
 */
export function group(state={}, action) {
    switch(action.type) {
        case SET_GROUP:

            // return Object.assign({}, state, {
            //     [action.groupIndex]: Object.assign({}, action.data)
            // });
            return Object.assign({}, state, action.data);
        case UPDATE_GROUP_DATA_BY_STEP_KEY:
            let {step, key, data} = action.data;
            try {
                state[step][key] = data;
                // return Object.assign({}, state);
                return deepClone(state)
            } catch {
                console.error('step,key无效', state, action);
                return state;
            }
        case SET_FLOWER:
            let newTopics = action.data,
                oldTopics = new Set(state['flower'])
            
            newTopics.forEach(e => {
                oldTopics.add(e)
            })
            
            return Object.assign({}, state, {
                'flower': Array.from(oldTopics)
            })
        default:
            return state;
    }
}

/**
 * Overview将更新6（降维图） 7（TimeLine) 8(相关性矩阵) 9（地图） 10（数据列表）
 * 这五个图的step, 根据step从group中取得数据
 */
export function otherStep(state={}, action) {
    switch(action.type) {
        case "6_SET_STEP" :
        case "9_SET_STEP" :
        // case "7_SET_STEP" :
        // case "8_SET_STEP" :
        // case "10_SET_STEP" :
            console.info('update', action); 
            return Object.assign({}, state, {[action.type[0]]: action.data})
        default:
            return state;
    }
}

/** 组别 */
export function groups(state=1, action) {
    switch(action.type) {
        case "ADD_A_GROUP":
            return state+1;
        default:
            return state;
    }
}