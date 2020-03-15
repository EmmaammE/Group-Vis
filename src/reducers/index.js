import { combineReducers } from 'redux';
import {topicWeight} from '../redux/topicWeight.redux'
import {topicView} from '../redux/topicView.redux'
import {timeLineView} from '../redux/timeLine.redux'
import {matrixView} from '../redux/matrixView.redux'
import {selectListView} from '../redux/selectList.redux.js'
import { step, group, otherStep } from './step';
import { person, year, dyasty, status, gender, topicData, dict } from './data'

// 设置语言， en_name对应接口中的数据键值
function KEY(state="name") {
    return state;
}

export default combineReducers({
    step,
    group,
    otherStep,
    person,
    year,
    dyasty,
    status,
    gender,
    topicData,
    KEY,
    topicWeight,
    topicView,
    timeLineView,
    matrixView,
    selectListView,
    dict
});