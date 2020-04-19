import {SET_STEP, ADD_STEP, SET_GROUP, UPDATE_GROUP_DATA_BY_STEP_KEY } from "../actions/types";
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
 *      // groupIndex对应组别，默认为1
 *      groupIndex: {
 *          step: data
 *      }
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
                // if(JSON.stringify(state[groupIndex][step][key]) === JSON.stringify(data)) {
                //     console.info(data)
                //     console.info('更新前后数据一样')
                // }
                state[step][key] = data;
                // return Object.assign({}, state);
                return deepClone(state)
                
            } catch {
                console.error('step,key无效', state, action);
                return state;
            }
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