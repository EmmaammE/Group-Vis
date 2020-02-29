import {SET_STEP, SET_GROUP} from "./types";

export function setStep(step) {
    return {
        type: SET_STEP,
        data: step
    };
}

export function setGroup(group) {
    return {
        type: SET_GROUP,
        data: group
    };
}