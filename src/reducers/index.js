import { combineReducers } from 'redux';
import {topicWeight} from '../redux/topicWeight.redux'
import {topicView} from '../redux/topicView.redux'
import {timeLineView} from '../redux/timeLine.redux'
import {matrixView} from '../redux/matrixView.redux'
import {selectListView} from '../redux/selectList.redux.js'
import {historyData} from '../redux/history.redux.js'
import { step, group, otherStep } from './step';
import { people, year, countedLayer, dict , vennstep} from './data'

// 设置语言， en_name对应接口中的数据键值
function KEY(state="name") {
    return state;
}

export default combineReducers({
    step,
    group,
    otherStep,
    vennstep,
    people,
    year,
    countedLayer,
    KEY,
    topicWeight,
    topicView,
    timeLineView,
    matrixView,
    selectListView,
    dict,
    historyData
});