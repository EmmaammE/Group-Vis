import {SET_STEP, ADD_STEP, SET_GROUP, UPDATE_GROUP_DATA_BY_STEP_KEY, SET_FLOWER, REMOVE_FLOWER } from "../actions/types";
import {deepClone} from '../util/tools'
import { TOPICS } from "../util/name";
export function step(state=0, action) {
    switch (action.type) {
        case SET_STEP:
            state = action.data
            return state;
        case ADD_STEP:
            return state + 1;
        default:
            return state;
    }
}

/**
 * group: 历史数据
 *  {   
 *      step: data
 *      'flower': 所有的花瓣
 *  }
 */
export function group(state={}, action) {
    switch(action.type) {
        case SET_GROUP:

            // return Object.assign({}, state, {
            //     [action.groupIndex]: Object.assign({}, action.data)
            // });
            return Object.assign({}, state, action.data);
        case UPDATE_GROUP_DATA_BY_STEP_KEY:
            let {step, key, data} = action.data;
            try {
                // if(JSON.stringify(state[groupIndex][step][key]) === JSON.stringify(data)) {
                //     console.info(data)
                //     console.info('更新前后数据一样')
                // }
                state[step][key] = data;
                // return Object.assign({}, state);
                return deepClone(state)
                
            } catch {
                console.error('step,key无效', state, action);
                return state;
            }
        case SET_FLOWER:
            let newTopics = action.data,
                oldTopics = {...state['flower']}
            
            newTopics.forEach(e => {
                if(oldTopics[e] === undefined) {
                    oldTopics[e] = 0;
                }
                oldTopics[e]++
            })
            
            return Object.assign({}, state, {
                'flower': oldTopics
            })

        // 清除一个主题
        case REMOVE_FLOWER:
            let {topicId, _step } = action.data;
            let newData = state[_step];
            let newFlower = state['flower']
            let temp = {
                weight: 1,
                content: ''
            };
            newData[TOPICS].filter(function(item) {
                if(item['id'] === topicId) {
                    this.weight -= item['weight']
                    if(item['content'].length === 1) {
                        this.content = item['content'][0];
                    } else {
                        this.content = item['content'].join('-')
                    }
                    return true;
                }
                return false;

            }, temp);

            console.log(temp)
            newData[TOPICS].forEach(e => e['weight'] = e['weight']/temp['weight'])

            if(newFlower[temp['content']] === 1) {
                delete newFlower[temp['content']]
            } else {
                newFlower[temp['content']] -= 1
            }

            sessionStorage.setItem("removeTopic", _step)

            return Object.assign({}, state, {
                'flower': newFlower,
                [_step]: newData
            })

        default:
            return state;
    }
}

/**
 * Overview将更新6（降维图） 7（TimeLine) 8(相关性矩阵) 9（地图） 10（数据列表）
 * 这五个图的step, 根据step从group中取得数据
 */
export function otherStep(state={}, action) {
    switch(action.type) {
        case "6_SET_STEP" :
        case "9_SET_STEP" :
        // case "7_SET_STEP" :
        // case "8_SET_STEP" :
        // case "10_SET_STEP" :
            console.info('update', action); 
            return Object.assign({}, state, {[action.type[0]]: action.data})
        default:
            return state;
    }
}

/** 组别 */
export function groups(state=1, action) {
    switch(action.type) {
        case "ADD_A_GROUP":
            return state+1;
        default:
            return state;
    }
}