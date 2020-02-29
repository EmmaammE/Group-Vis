import {SET_STEP, SET_GROUP} from "../actions/types";

export function step(state=1, action) {
    switch (action.type) {
        case SET_STEP:
            return action.data;
        default:
            return state;
    }
}

export function group(state={1:1000}, action) {
    switch(action.type) {
        case SET_GROUP:
            return Object.assign(state,action.data);
        default:
            return state;
    }
}