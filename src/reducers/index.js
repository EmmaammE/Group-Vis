import { combineReducers } from 'redux';
import {topicWeight} from '../redux/topicWeight.redux'
import {topicView} from '../redux/topicView.redux'
import {timeLineView} from '../redux/timeLine.redux'
import {matrixView,peopleToList} from '../redux/matrixView.redux'
import {selectListView} from '../redux/selectList.redux.js'
import {historyData} from '../redux/history.redux.js'
import { step, group, otherStep } from './step';
import { people, vennstep} from './data'
import { dict} from '../redux/dict.redux.js'

// 设置语言， en_name对应接口中的数据键值
function KEY(state="en_name") {
    return state;
}

export default combineReducers({
    step,
    group,
    otherStep,
    vennstep,
    people,
    KEY,
    topicWeight,
    topicView,
    timeLineView,
    matrixView,
    selectListView,
    historyData,
    peopleToList,
    dict
});