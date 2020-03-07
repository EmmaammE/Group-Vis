import {SET_STEP, SET_GROUP, ADD_STEP } from "./types";

export function setStep(step) {
    return {
        type: SET_STEP,
        data: step
    };
}

export function addStep() {
    return {
        type: ADD_STEP,
    }
}

export function setGroup(group) {
    return {
        type: SET_GROUP,
        data: group
    };
}