import {
    SET_PERSON,
    SET_DYNASTY,
    SET_GENDER,
    SET_STATUS,
    SET_YEAR,
    SET_TOPIC_RELATED_DATA
} from './types';

// 相关的各类筛选条件， 暂时写了看后面用不用
export function setPerson(person) {
    return {
        type: SET_PERSON,
        data: person
    };
}

export function setDyasty(dynasty) {
    return {
        type: SET_DYNASTY,
        data: dynasty
    };
}

export function setGender(gender) {
    return {
        type: SET_GENDER,
        data: gender
    };
}

export function setStatus(status) {
    return {
        type: SET_STATUS,
        data: status
    };
}

export function setYear(year) {
    return {
        type: SET_YEAR,
        data: year
    };
}

/**
 * topic所有相关数据
 * pmi_node
 * topic2sentences
 * label2topics 
 */
export function setTopicData(data) {
    return {
        type: SET_TOPIC_RELATED_DATA,
        data
    }
}