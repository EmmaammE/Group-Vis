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

const GRID_ITEM_TEMPLATE = { next: -1, size: 1, selected: 0 };
class SecondPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            grid: [],
            gridBack: {},
            // [第几层， 第几个，step]
            hoverIndex: [0, 0, 0],
            // step: [第几层，第几个]
            step2index: { 1: [0, 0] },
        }
        this.clickFlower = this.clickFlower.bind(this);
        this.toCompare = this.toCompare.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.group) !== JSON.stringify(this.props.group)
            && prevProps.step !== this.props.step
        ) {
            let { grid, step2index, hoverIndex, lastHoverIndex } = this.state;
            let { group, step } = this.props;
            let another = sessionStorage.getItem('another');
            if (another !== null) {
                let newGrid = grid.slice(0);
                let _grid = newGrid[0];

                step2index[step] = [0, _grid.size];

                _grid.size += 1;
                _grid.positions.push(group[step][POSITIONS]);
                _grid.step.push(step);
                _grid.data.push(group[step][TOPICS])

                sessionStorage.removeItem('another')


                this.setState({
                    grid: newGrid,
                    step2index
                })
            } else if (grid.length === 0) {
                let newGrid = [({
                    ...GRID_ITEM_TEMPLATE,
                    step: [1], positions: [group[1][POSITIONS]], data: [group[1][TOPICS]]
                })]

                this.setState({ grid: newGrid })

            } else {
                let newGrid = grid.slice(0);

                let similiarStep = sessionStorage.getItem('similiar');
                if (step === +similiarStep) {
                    // 是相似的人， 需要在同层增加花朵
                    let currentLayer = hoverIndex[0];

                    let newIndex = newGrid[currentLayer].next;

                    newGrid[currentLayer].next += 1;

                    step2index[step] = [currentLayer, newIndex];

                    let _grid = newGrid[currentLayer];
                    _grid.size += 1;
                    _grid.positions.push(group[step][POSITIONS]);
                    _grid.step.push(step);
                    _grid.data.push(group[step][TOPICS])

                    this.setState({
                        grid: newGrid,
                        step2index,
                    })
                } else {
                    if (step === similiarStep + 1) {
                        // 是相似的人和当前人产生的群体， 需要在同层增加花朵并连线

                        // 清除session
                        sessionStorage.removeItem('similiar');
                    }

                    let currentLayer = hoverIndex[0];
                    let lastIndex = step2index[step - 1];

                    if (lastHoverIndex !== undefined) {
                        lastIndex = step2index[lastHoverIndex]
                    }


                    // 被选中的这朵❀没有下一层
                    if (currentLayer === grid.length - 1) {
                        newGrid[lastIndex[0]].next = 1;
                        newGrid.push({
                            ...GRID_ITEM_TEMPLATE,
                            step: [step],
                            positions: [group[step][POSITIONS]],
                            data: [group[step][TOPICS]]
                        });
                        // step2index[step] = [1,0];
                        step2index[step] = [lastIndex[0] + 1, 0];
                    } else {
                        // 被选中的这朵❀有下一层
                        // 新的❀是这一层的第newIndex个
                        let newIndex = newGrid[currentLayer].next;

                        newGrid[currentLayer].next += 1;

                        step2index[step] = [currentLayer + 1, newIndex];

                        let _grid = newGrid[currentLayer + 1];
                        _grid.size += 1;
                        _grid.positions.push(group[step][POSITIONS]);
                        _grid.step.push(step);
                        _grid.data.push(group[step][TOPICS])
                    }

                    this.setState({
                        // grids: newGrid,
                        grid: newGrid,
                        step2index,
                    })
                }
            }
        }

        if (prevProps.countedLayer !== this.props.countedLayer) {
            this._updateCountedLayer();
        }
    }

    clickFlower(step) {
        let thisIndex = this.state.step2index[step];
        // 设置这一层的selected
        let { grid, gridBack, hoverIndex } = this.state;

        let hasNext = false;
        // 如果选中的这一层已经有了下一层，且不是在该花朵所在的层选择该花朵时创建的
        if (thisIndex[0] + 1 <= grid.length - 1 && grid[thisIndex[0]].selected !== thisIndex[1]) {
            // 当前被选中的step 
            hasNext = true;
            gridBack[hoverIndex[2]] = grid.slice(thisIndex[0] + 1);
            grid = grid.slice(0, thisIndex[0] + 1);
            grid[thisIndex[0]].next = -1;
        }
        // 如果该🌼已有备份
        if (gridBack[step] !== undefined && grid[thisIndex[0]].selected !== thisIndex[1]) {
            // 如果选中该❀前，同层的❀已有下一层
            if (hasNext === true) {
                grid = grid.slice(0, thisIndex[0] + 1);
            }
            gridBack[step].forEach(e => {
                grid.push(e)
            })
            grid[thisIndex[0]].next = gridBack[step][0].size;
        }

        // 更新选中的序号
        grid[thisIndex[0]].selected = thisIndex[1];

        this.setState({
            grid,
            lastHoverIndex: step,
            hoverIndex: [...thisIndex, step],
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
        // let topicData = group[step]["topicView"];
        // console.log("topicData",topicData)
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

    render() {
        let { grid, hoverIndex } = this.state;
        let detail = grid[hoverIndex[0]], y = hoverIndex[1];
        let _value = Math.max(...grid.map(g => g.size));

        return (
            <div className="second-panel">
                <Header title="Overview"></Header>
                <div className="btn-container">
                    <CircleBtn type={11} active={true} onClick={this.toCompare} />
                </div>

                <div className="content-panel">
                    <div className="legend-container">
                        <img src={LEGEND} alt="" />
                    </div>
                    {/* box-width + translate[0] = viewBox/2 : 为了留文字的空间*/}
                    {
                        detail && <div className="flower-detail">
                            <svg width="100%" height="100%" viewBox="0 0 620 620">
                                <g transform="translate(60,60)">
                                    <Flower
                                        type={0}
                                        marginWidth={0}
                                        leaves={detail['data'][y]}
                                        positions={Object.assign({}, detail['positions'][y])}
                                        step={detail['step'][y]}
                                    />
                                </g>
                            </svg>
                        </div>
                    }
                    <div className="flower-divider"></div>
                    <div className="flower-overview">
                        {
                            grid.map((item, i) => {
                                if (item) {
                                    return (
                                        <div className="grid-line" key={'line-' + i}>
                                            <FlowerContainer
                                                width = {100 * item.size /_value + '%'}
                                                step={item.step}
                                                leaves={item.data}
                                                current={item.size}
                                                next={item.next}
                                                _selected={item && item.selected}
                                                _nextSelected={grid[i + 1] && grid[i + 1].selected}
                                                _hovered={i === hoverIndex[0] ? hoverIndex[1] : -1}
                                                positions={item.positions}
                                                cb={this.clickFlower}
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