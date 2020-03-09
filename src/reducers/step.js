import {SET_STEP, ADD_STEP, SET_GROUP} from "../actions/types";

export function step(state=0, action) {
    switch (action.type) {
        case SET_STEP:
            return action.data;
        case ADD_STEP:
            return state + 1;
        default:
            return state;
    }
}

/**
 * group: 历史数据
 * Map {step: num}
 */
export function group(state={}, action) {
    switch(action.type) {
        case SET_GROUP:
            return Object.assign(state,action.data);
        default:
            return state;
    }
}