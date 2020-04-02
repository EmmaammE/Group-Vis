import {
    SET_PERSON,
    SET_VENN_STEP
} from '../actions/types';

export function people(state = {}, action) {
    switch (action.type) {
        case SET_PERSON:
            return Object.assign({}, action.data);
        default:
            return state;
    }
}

export function vennstep(state = [], action) {
    switch (action.type) {
        case SET_VENN_STEP:
            let { data } = action;
            if (state.indexOf(data) === -1) {
                return [...state, data]
            } else {
                return state.filter(val => val !== data)
            }
        default:
            return state;
    }
}