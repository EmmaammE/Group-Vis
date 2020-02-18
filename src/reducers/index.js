import {SET_STEP} from "../actions/types";

export default function(state = {}, action) {
    switch (action.type) {
        case SET_STEP:
            return {data: action.data};
        default:
            return state;
    }
}