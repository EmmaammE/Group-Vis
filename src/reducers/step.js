import {SET_STEP} from "../actions/types";

export function step(state=0, action) {
    switch (action.type) {
        case SET_STEP:
            return action.data;
        default:
            return state;
    }
}