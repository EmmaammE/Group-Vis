import {
    SET_PERSON,
    SET_COUNTED_LAYER,
    SET_YEAR,
    SET_DICT,
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

export function countedLayer(state = {}, action) {
    switch (action.type) {
        case SET_COUNTED_LAYER:
            return Object.assign({}, state, action.data);
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

/*  year: 表示相关的年份范围 */
export function year(state = {
    low: -9999,
    high: 9999
}, action) {
    switch (action.type) {
        case SET_YEAR:
            return Object.assign({}, state, action.data);
        default:
            return state;
    }
}

export function dict(state = {}, action) {
    switch (action.type) {
        case SET_DICT:
            return Object.assign({}, state, action.data)
        default:
            return state;
    }
}