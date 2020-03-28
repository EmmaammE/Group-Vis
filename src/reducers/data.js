import {
    SET_PERSON,
    SET_COUNTED_LAYER,
    SET_YEAR,
    SET_TOPIC_RELATED_DATA,
    SET_DICT
} from '../actions/types';

export function person(state = {}, action) {
    switch (action.type) {
        case SET_PERSON:
            return action.data;
        default:
            return state;
    }
}

export function countedLayer(state = {}, action) {
    switch (action.type) {
        case SET_COUNTED_LAYER:
            return action.data;
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
            return action.data;
        default:
            return state;
    }
}

export function topicData(state = {}, action) {
    switch(action.type) {
        case SET_TOPIC_RELATED_DATA:
            return action.data;
        default:
            return state;
    }
}

export function dict(state = {}, action) {
    switch(action.type) {
        case SET_DICT:
            return Object.assign(state, action.data)
        default:
            return state;
    }
}