import { combineReducers } from 'redux';
import { step } from './step';
import { person, year, dyasty, status, gender, topicData } from './data'

export default combineReducers({
    step,
    person,
    year,
    dyasty,
    status,
    gender,
    topicData
});