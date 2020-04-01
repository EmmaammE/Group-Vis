import {
    SET_PERSON,
    SET_COUNTED_LAYER,
    SET_YEAR,
    SET_DICT,
    SET_STEP_2_LAYER,
    SET_VENN_STEP
} from './types';

// topicView中brush的人， 即Reduced-View高亮的人
export function setPerson(person) {
    console.log('invoke setPerson', person);
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

export function setVeenedStep(step) {
    return {
        type: SET_VENN_STEP,
        data: step
    }
}

export function setYear(year) {
    return {
        type: SET_YEAR,
        data: year
    };
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