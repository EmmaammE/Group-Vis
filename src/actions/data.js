import {
    SET_PERSON,
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

export function setVeenedStep(step) {
    return {
        type: SET_VENN_STEP,
        data: step
    }
}