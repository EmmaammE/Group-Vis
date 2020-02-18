import {SET_STEP} from "./types";

export function setStep(step) {
    return {
        type: SET_STEP,
        data: step
    };
}