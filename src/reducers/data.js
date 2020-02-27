import {
    SET_PERSON,
    SET_DYNASTY,
    SET_GENDER,
    SET_STATUS,
    SET_YEAR,
    SET_TOPIC_RELATED_DATA
} from '../actions/types';

export function person(state = {}, action) {
    switch (action.type) {
        case SET_PERSON:
            return action.data;
        default:
            return state;
    }
}

export function dyasty(state = {}, action) {
    switch (action.type) {
        case SET_DYNASTY:
            return action.data;
        default:
            return state;
    }
}

export function gender(state = {}, action) {
    switch (action.type) {
        case SET_GENDER:
            return action.data;
        default:
            return state;
    }
}

export function status(state = {}, action) {
    switch (action.type) {
        case SET_STATUS:
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