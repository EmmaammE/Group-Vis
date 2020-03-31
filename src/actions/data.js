import {
    SET_PERSON,
    SET_COUNTED_LAYER,
    SET_YEAR,
    SET_TOPIC_RELATED_DATA,
    SET_DICT,
    SET_STEP_2_LAYER
} from './types';

// 相关的各类筛选条件， 暂时写了看后面用不用
export function setPerson(person) {
    return {
        type: SET_PERSON,
        data: person
    };
}

export function setCountedLayer(layer) {
    return {
        type: SET_COUNTED_LAYER,
        data: layer
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
 */
export function setTopicData(data) {
    return {
        type: SET_TOPIC_RELATED_DATA,
        data
    }
}

export function setDict(data) {
    return {
        type: SET_DICT,
        data
    }
}

export function setStep2Layer(step, layer) {
    return {
        type: SET_STEP_2_LAYER,
        data: { step, layer}
    }
}