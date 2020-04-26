import React from 'react';
import './secondPanel.css'
import Header from '../../component/header/Header';
import FlowerContainer from '../../component/flower/flowerContainer';
import { addStep, setOtherStep, compareGroup } from '../../actions/step';
import { TOPICS, POSITIONS } from '../../util/name';
import { connect } from 'react-redux';
import { updateTopicView } from '../../redux/topicView.redux';
import { updateMatrix } from '../../redux/matrixView.redux';
import { updateSelectList } from '../../redux/selectList.redux';
import { updateTimeLine } from '../../redux/timeLine.redux';
import { initTopicWeight } from '../../redux/topicWeight.redux';
import { addHistoryData } from '../../redux/history.redux';
import LEGEND from '../../assets/legend/flower.png';
import Flower from '../../component/flower/flower';
import CircleBtn from '../../component/button/circlebtn';
import Blobs from '../../component/blob/blob';

const GRID_ITEM_TEMPLATE = { next: -1, size: 1, selected: 0 };
class SecondPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            grid: [],
            // grid: [{"next":2,"size":1,"selected":0,"step":[1],"positions":[{"4921":[0.3788028680828691,0.39595518113357003,"李格非"],"15378":[-0.08791303998484105,-0.7056130209753252,"李清照"],"15379":[0.21487799020170562,0.03372699978657273,"赵明诚"],"43374":[0.06103582979269742,-0.02482997164673821,"张汝舟"],"48805":[0.1914571261916407,-0.41247609633418825,"韩玉父"],"50876":[-0.9724974576870214,0.2457022407247119,"端木采"],"50879":[0.21423668340295096,0.4675346673113978,"毛晋"]}],"data":[[{"weight":0.3333333333333333,"content":["李清照","著述关系类"],"ratio":0.428571},{"weight":0.3333333333333333,"content":["李清照","著述关系类","序跋文字"],"ratio":0.428571},{"weight":0.3333333333333333,"content":["李清照"],"ratio":1}]]},{"next":-1,"size":2,"selected":0,"step":[2,3],"positions":[{"15378":[-0.8864821086140969,-0.29092751011475426,"李清照"],"15379":[0.325868556039981,1.103276683967385,"赵明诚"],"43374":[0.9709706066935145,-0.6883076719656546,"张汝舟"],"48805":[-0.4103570541193981,-0.12404150188697668,"韩玉父"]},{"15378":[-0.8864821086140969,-0.29092751011475426,"李清照"],"15379":[0.325868556039981,1.103276683967385,"赵明诚"],"43374":[0.9709706066935145,-0.6883076719656546,"张汝舟"],"48805":[-0.4103570541193981,-0.12404150188697668,"韩玉父"]}],"data":[[{"weight":0.038702632318818715,"content":["著述关系类","序跋文字"],"ratio":0.5},{"weight":0.12878270608650047,"content":["建炎","正德","天会"],"ratio":0.5},{"weight":0.13982968986662211,"content":["赵明诚"],"ratio":0.5},{"weight":0.2027572593241588,"content":["韩玉父"],"ratio":0.5},{"weight":0.2111326817552329,"content":["李清照"],"ratio":1},{"weight":0.27879503064866706,"content":["张汝舟"],"ratio":0.5}],[{"weight":0.038702632318818715,"content":["著述关系类","序跋文字"],"ratio":0.5},{"weight":0.12878270608650047,"content":["建炎","正德","天会"],"ratio":0.5},{"weight":0.13982968986662211,"content":["赵明诚"],"ratio":0.5},{"weight":0.2027572593241588,"content":["韩玉父"],"ratio":0.5},{"weight":0.2111326817552329,"content":["李清照"],"ratio":1},{"weight":0.27879503064866706,"content":["张汝舟"],"ratio":0.5}]]}],
            // gridBack: {},
            // [第几层， 第几个，step]
            hoverIndex: [0, 0, 1],
            showIndex: [0, 0, 1],
            // step: [第几层，第几个]
            step2index: { 1: [0, 0] },
            similarGrids: [],
            gridsIndex: {},
        }
        this.clickFlower = this.clickFlower.bind(this);
        this._hoverFlower = this._hoverFlower.bind(this);
        this.toCompare = this.toCompare.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.group) !== JSON.stringify(this.props.group)) {
            if(prevProps.step !== this.props.step) {
                let { grid, step2index, hoverIndex, similarGrids, gridsIndex } = this.state;
                let { group, step } = this.props;
                let another = sessionStorage.getItem('another');
                if (grid.length === 0) {
                    let newGrid = [({
                        ...GRID_ITEM_TEMPLATE,
                        connections: {},
                        step: [1], positions: [group[1][POSITIONS]], data: [group[1][TOPICS]]
                    })]
    
                    this.setState({ grid: newGrid })
    
                } else {
                    let similarGrid = [-1, -1, -1];
                    let newGrid = grid.slice(0);

                    if(another !== null ) {
                        let _grid = newGrid[0];
        
                        step2index[step] = [0, _grid.size];
        
                        _grid.size += 1;
                        _grid.positions.push(group[step][POSITIONS]);
                        _grid.step.push(step);
                        _grid.data.push(group[step][TOPICS])
        
                        sessionStorage.removeItem('another')
        
                    } else {
                        let similiarStep = sessionStorage.getItem('similiar');
                        if (step === +similiarStep) {
                            // 是相似的人， 需要在同层增加花朵
                            let currentLayer = hoverIndex[0], newIndex;
                            let _grid = newGrid[currentLayer];
                            _grid.size += 1;
                            
                            let origin_step = +sessionStorage.getItem('similiar_origin');
                            if( origin_step === step - 1) {

                                newIndex = newGrid[currentLayer].size - 1;
                                _grid.positions.push(group[step][POSITIONS]);
                                _grid.step.push(step);
                                _grid.data.push(group[step][TOPICS]);
                            } else {

                                newIndex = step2index[origin_step][1] + 1;

                                _grid.positions.splice(newIndex, 0, group[step][POSITIONS]);
                                _grid.step.splice(newIndex, 0, step);
                                _grid.data.splice(newIndex, 0, group[step][TOPICS]);


                                let connections = {};
                                // 更新step的index
                                for(let i = newIndex + 1; i< _grid.step.length; i++) {
                                    if(step2index[_grid.step[i]]) {
                                        let index = step2index[_grid.step[i]][1];
                                        step2index[_grid.step[i]][1] += 1;
                                        if(_grid.connections[index]) {
                                            connections[index+1] = _grid.connections[index];
                                            delete _grid.connections[index]
                                        }
                                    }
                                }
                                _grid.connections = {..._grid.connections, ...connections}

                                // 更新链接
                                if(currentLayer >= 1) {
                                    for(let key in newGrid[currentLayer-1].connections) {
                                        newGrid[currentLayer-1].connections[key].co.forEach(e => {
                                            if(e >= newIndex) {
                                                e+=1
                                            }
                                        })
                                    }
                                }
                            }
                            step2index[step] = [currentLayer, newIndex];
                            
                            if(currentLayer >= 1) {
                                newGrid[currentLayer - 1].next += 1;
                            }
                        } else {
                            let currentLayer = hoverIndex[0];
                            let similiarFlag = false;
                            if (step === +similiarStep + 1) {
                                similiarFlag = true;
                                // 是相似的人和当前人产生的群体， 需要在同层增加花朵并连线
                            }
                            
                            // 被选中的这朵❀没有下一层
                            if (currentLayer === grid.length - 1) {
                                newGrid[currentLayer].next = 1;

                                if(!similiarFlag) {
                                    newGrid[currentLayer].connections[hoverIndex[1]] 
                                        = [0]
                                }
                                

                                newGrid.push({
                                    ...GRID_ITEM_TEMPLATE,
                                    connections: {},
                                    step: [step],
                                    positions: [group[step][POSITIONS]],
                                    data: [group[step][TOPICS]]
                                });
                                // step2index[step] = [1,0];
                                step2index[step] = [currentLayer+1, 0];
                            } else {
                                // 被选中的这朵❀有下一层
                                // 新的❀是下一层的第newIndex个
                                let newIndex = newGrid[currentLayer+1].size;
        
                                newGrid[currentLayer].next += 1;
                                if(!similiarFlag) {
                                    if(newGrid[currentLayer].connections[hoverIndex[1]]) {
                                        newGrid[currentLayer].connections[hoverIndex[1]].push(newIndex)
                                    } else {
                                        newGrid[currentLayer].connections[hoverIndex[1]] = [newIndex]
                                    }
                                }

                                step2index[step] = [currentLayer + 1, newIndex];
    
                                let _grid = newGrid[currentLayer + 1];
                                _grid.size += 1;
                                _grid.positions.push(group[step][POSITIONS]);
                                _grid.step.push(step);
                                _grid.data.push(group[step][TOPICS])

                                // 重排序

                                // 根据该行所有花朵的父节点（选中的❀这一层）的排列顺序重排
                                let order = new Array(_grid.size).fill(_grid.size);

                                // 原顺序
                                let origin = {};
                                let originIndex2step = {};
                                _grid.step.forEach((step, i) => {
                                    origin[step] = i;
                                    originIndex2step[i] = step;
                                })

                                for(let key in newGrid[currentLayer].connections) {
                                    newGrid[currentLayer].connections[key].forEach(child => {
                                        order[child] = key;
                                    })
                                }

                                _grid.step.sort((a, b) => {
                                    return order[origin[a]] - order[origin[b]]
                                })
                            
                                let newOrder = {};
                                _grid.step.forEach((step, i) => {
                                    newOrder[i] = step;
                                    // 更新已存的index
                                    step2index[step][1] = i;
                                })

                                let posArr = [], dataArr = [];
                                for(let i=0; i<_grid.size; i++) {
                                    let step = newOrder[i];
                                    let _origin = origin[step];
                                    posArr.push(_grid.positions[_origin])
                                    dataArr.push(_grid.data[_origin])
                                }

                                _grid.positions = posArr;
                                _grid.data = dataArr;
                            
                                // 如果这一层有链接
                                let connections = {};
                                for(let key in _grid.connections) {
                                    let newIndex = step2index[originIndex2step[key]][1];
                                    connections[newIndex] = _grid.connections[key];
                                }
                                _grid.connections = connections;

                                // 如果有链接到这一层
                                for(let key in newGrid[currentLayer].connections) {
                                    newGrid[currentLayer].connections[key] = 
                                        newGrid[currentLayer].connections[key].map(index => 
                                            step2index[originIndex2step[index]][1]
                                        )
                                }
                            } 
                            
                            if(similiarFlag) {
                                let x =step2index[step-1][0];
                                // similarGrid[0] = step2index[step - 1][1]
                                // 合在一起的群体的坐标
                                // similarGrid[1] = step2index[step][1]
                                let origin_step = +sessionStorage.getItem('similiar_origin');
                                // 被推荐的群体的坐标
                                // similarGrid[2] = step2index[origin_step][1]

                                // 推荐的相似的人的坐标 合在一起的群体的坐标 被推荐的群体的坐标
                                similarGrid = [step-1, step, origin_step]
                                // 清除session
                                sessionStorage.removeItem('similiar');
                                sessionStorage.removeItem('similiar_origin');

                                if(gridsIndex[x] === undefined) {
                                    gridsIndex[x] = []
                                }
                                gridsIndex[x].push(similarGrids.length)
                                similarGrids.push(similarGrid);
                            }

                        }
                    }

                    this.setState({
                        grid: newGrid,
                        step2index,
                        similarGrids,
                        gridsIndex
                    })
                }
            }

            let removeTopic = sessionStorage.getItem('removeTopic');
            if(removeTopic!==null) {
                this._updateTopicAfterRemove(removeTopic)
            }
        }

        if (prevProps.countedLayer !== this.props.countedLayer) {
            this._updateCountedLayer();
        }
    }

    _updateTopicAfterRemove(step) {
        try {

            let {step2index, grid} = this.state;
            let index = step2index[step];
            grid[index[0]]['data'][index[1]] = this.props.group[step][TOPICS];
            this.setState({
                grid
            })
            sessionStorage.removeItem('removeTopic')
        } catch(err) {
            sessionStorage.removeItem('removeTopic')
        }
    }

    clickFlower(step) {
        let thisIndex = this.state.step2index[step];
        // 设置这一层的selected
        let { grid } = this.state;

        // 更新选中的序号
        grid[thisIndex[0]].selected = thisIndex[1];

        this.setState({
            grid,
            hoverIndex: [...thisIndex, step],
            showIndex: [...thisIndex, step]
        })

        this.updateViews(step);
    }

    updateViews(step) {
        let { group, updateTimeLine, updateMatrix, updateSelectList,
            updateTopicView, addHistoryData, setOtherStep } = this.props;

        // 更新details
        updateTimeLine(group[step]["timelineView"]);
        updateMatrix(group[step]["matrixView"]);
        setOtherStep(9, step);
        updateSelectList(group[step]["selectView"]);

        // 降维图
        setOtherStep(6, step);
        updateTopicView(group[step]["topicView"]);
        addHistoryData(group[step]["historyData"])
    }

    toCompare() {
        let { group, vennStep, KEY, compareGroup } = this.props;
        let size = vennStep.length;
        try {
            let step1 = vennStep[size - 1], step2 = vennStep[size - 2];
            console.log('click compare', step1, step2)
            compareGroup(
                KEY,
                Object.keys(group[step1]['people']),
                Object.keys(group[step2]['people']),
                [step1, step2]
            )
        } catch (err) {
            console.error(err)
        }
    }

    _hoverFlower(step) {
        let { step2index } = this.state;

        this.setState({
            showIndex: [...step2index[step], step]
        })
    }

    render() {
        let { grid, hoverIndex, showIndex, similarGrids, gridsIndex, step2index} = this.state;
        let { vennStep } = this.props;
        let detail = grid[showIndex[0]], y = showIndex[1], step = showIndex[2];
        let _value = Math.max(...grid.map(g => g.size));
        let style;

        if(_value === 1 ) {
            style = {width: '45%'}
        }

        return (
            <div className="second-panel">
                <Header title="Cohort-level Analyzer"></Header>
                <div className="btns-container">
                    <CircleBtn type={11} active={true} onClick={this.toCompare} />
                </div>
                <div className="content-panel">
                    {/* box-width + translate[0] = viewBox/2 : 为了留文字的空间*/}
                    {
                        detail && 
                        <div className="flower-detail">
                           <div>
                                <p className="g-chart-title">Cohort Metaphor</p>
                                <svg width="100%" height="100%" viewBox="0 0 620 620">
                                    <g transform="translate(60,60)">
                                        <Flower
                                            type={0}
                                            marginWidth={0}
                                            leaves={detail['data'][y]}
                                            positions={Object.assign({}, detail['positions'][y])}
                                            step={detail['step'][y]}
                                            venned={vennStep.indexOf(step)!==-1}
                                        />
                                    </g>
                                </svg>
                           </div>
                            {
                                vennStep.length > 0 && 
                                <div>
                                    <p className="g-chart-title">Cohort Set Analyzer</p>
                                    <div className="venn-container">
                                        <Blobs />
                                    </div>
                                </div>
                            } 
                        </div>

                    }
                    <div className="flower-divider"></div>
                    <p className="g-chart-title">Cohorts Manipulator</p>
                    <div className="flower-overview">
                        <div className="legend-container">
                            <img src={LEGEND} alt="" />
                        </div>
                        {
                            grid.map((item, i) => {
                                if (item) {
                                    return (
                                        <div 
                                            className="grid-line" key={'line-' + i}
                                            style={style}
                                        >
                                            <FlowerContainer
                                                // width = {100 * item.size /_value + '%'}
                                                similiarFlag = { gridsIndex[i] !== undefined
                                                    ? gridsIndex[i].map(e => similarGrids[e]
                                                        .map(step => step2index[step][1]))
                                                    : [] }
                                                max = {_value}
                                                step={item.step}
                                                leaves={item.data}
                                                current={item.size}
                                                next={item.next}
                                                _selected={item && item.selected}
                                                _nextSelected={grid[i + 1] && grid[i + 1].selected}
                                                _hovered={i === hoverIndex[0] ? hoverIndex[1] : -1}
                                                positions={item.positions}
                                                cb={this.clickFlower}
                                                hovercb = {this._hoverFlower}
                                                connections = {item.connections}
                                            />
                                        </div>
                                    )
                                } else {
                                    return null
                                }
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        step: state.step,
        group: state.group,
        countedLayer: state.countedLayer,
        vennStep: state.vennstep,
        KEY: state.KEY
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        addStep: () => dispatch(addStep()),
        setOtherStep: (key, step) => dispatch(setOtherStep(key, step)),
        updateTopicView: data => dispatch(updateTopicView(data)),
        updateTimeLine: data => dispatch(updateTimeLine(data)),
        updateMatrix: data => dispatch(updateMatrix(data)),
        updateSelectList: data => dispatch(updateSelectList(data)),
        initTopicWeight: data => dispatch(initTopicWeight(data)),
        addHistoryData: data => dispatch(addHistoryData(data)),
        compareGroup: (KEY, person_ids1 = [], person_ids2 = [], steps = []) => dispatch(compareGroup(dispatch, KEY, person_ids1, person_ids2, steps))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SecondPanel);