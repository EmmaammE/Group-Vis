import { combineReducers } from 'redux';
import { step, group } from './step';
import { person, year, dyasty, status, gender, topicData } from './data'

export default combineReducers({
    step,
    group,
    person,
    year,
    dyasty,
    status,
    gender,
    topicData
});