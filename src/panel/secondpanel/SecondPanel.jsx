import React from 'react';
import './secondPanel.css'
import Header from '../../component/header/Header';
import CircleBtn from '../../component/button/circlebtn';
import FlowerContainer from '../../component/flower/flowerContainer';
import { addStep, setOtherStep } from '../../actions/step';
import { TOPICS, POSITIONS } from '../../util/name';
import { connect } from 'react-redux';
import { updateTopicView } from '../../redux/topicView.redux';
import { updateMatrix } from '../../redux/matrixView.redux';
import { updateSelectList } from '../../redux/selectList.redux';
import { updateTimeLine } from '../../redux/timeLine.redux';

const GRID_ITEM_TEMPLATE = { next: -1, size: 0, property: [], selected: -1 };
class SecondPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            grid: [
                // {next:-1, size:1, property:[8],selected:0, positions:[], titles: Array(8).fill(null).map((e,i)=>'topic-'+i)},
                // {next:-1, size:2, property:[8,9],selected:0, positions:[]},
                // {next:4, size:3, property:[7,9,10],selected:2, positions:[]},
                // {next:-1, size:4, property:[7,7,5,10],selected:2, positions:[]},
            ],
            gridBack: {},
            // [第几层， 第几个，step]
            hoverIndex: [0, 0, 0],
            btnStatus: [false, false, false, false],
            // step: [第几层，第几个]
            step2index: { 1: [0, 0] },
        }
        this.clickBtn = this.clickBtn.bind(this);
        this.clickFlower = this.clickFlower.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.group) !== JSON.stringify(this.props.group)) {
            // if(prevProps.step !== this.props.step) {
            let { grid, step2index, hoverIndex} = this.state;
            let { group, step } = this.props;

            if (grid.length === 0 || this.props.step === 1) {
                // console.log('update init');
                // 暂定8片花瓣
                let titles = group[1][TOPICS].slice(0, 8).map(arr => arr[1]);
                let newGrid = [({
                    ...GRID_ITEM_TEMPLATE, size: 1, selected: 0, step: [1],
                    property: [titles.length], titles: [titles], positions: [group[1][POSITIONS]]
                })]

                this.setState({ grid: newGrid })
            } else {
                let newGrid = grid.slice(0);
                let titles = group[step][TOPICS].slice(0, 8).map(arr => arr[1]);

                let currentLayer = hoverIndex[0]
                let lastIndex = step2index[step - 1];
                // 被选中的这朵❀没有下一层
                if (currentLayer === grid.length-1) {
                    newGrid[lastIndex[0]].next = 1;
                    newGrid.push({
                        ...GRID_ITEM_TEMPLATE, size: 1, step: [step],
                        property: [titles.length], titles: [titles], positions: [group[step][POSITIONS]]
                    });
                    // step2index[step] = [1,0];
                    step2index[step] = [lastIndex[0] + 1, 0];
                } else {
                // 被选中的这朵❀有下一层
                    // 新的❀是这一层的第newIndex个
                    let newIndex = newGrid[currentLayer].next;
                
                    newGrid[currentLayer].next += 1;

                    step2index[step] = [currentLayer+1, newIndex];

                    let _grid = newGrid[currentLayer+1];
                    _grid.size += 1;
                    _grid.property.push(titles.length);
                    _grid.titles.push(titles) ;
                    _grid.positions.push(group[step][POSITIONS]);
                    _grid.step.push(step);
                }

                this.setState({
                    grid: newGrid,
                    step2index,
                })
            }
        }

        if (prevProps.countedLayer !== this.props.countedLayer) {
            this._updateCountedLayer();
        }
    }

    clickBtn(i) {
        let { btnStatus, hoverIndex } = this.state;
        let step = hoverIndex[2];
        let { group, updateTimeLine, updateMatrix, updateSelectList } = this.props;
        // step为被选中的❀的step
        switch (i) {
            case 0:
                // TimeLine
                updateTimeLine(group[step]["timelineView"]);
                break;
            case 1:
                // Matrix
                updateMatrix(group[step]["matrixView"]);
                break;
            case 2:
                // map
                this.props.setOtherStep(7 + i, hoverIndex[2]);
                break;
            case 3:
                // selectList
                updateSelectList(group[step]["selectView"]);
                break;

            default:
                break;
        }
        btnStatus[i] = !btnStatus[i];

        this.setState({
            btnStatus
        })
    }

    clickFlower(step) {
        let thisIndex = this.state.step2index[step];
        // 设置这一层的selected
        let { grid, gridBack, hoverIndex } = this.state;

        // 如果已经有了下一层
        if(thisIndex[0] < grid.length-1) {
            gridBack[hoverIndex[step]] = grid.slice(thisIndex[0]+1);
            grid = grid.slice(0, hoverIndex[0]+1);
        }
        // 如果该🌼已有备份
        if(gridBack[step]!==undefined) {
            grid = [grid, ...gridBack[step]];
        }
        // 更新选中的序号
        grid[thisIndex[0]].selected = thisIndex[1];
        // 更新降维图
        this.props.setOtherStep(6, step);
        // 更新topicView
        this.props.updateTopicView(this.props.group[step]["topicView"])
        this.setState({
            grid,
            hoverIndex: [...thisIndex, step],
            btnStatus: new Array(4).fill(false)
        })
    }

    render() {
        let { grid, btnStatus, hoverIndex } = this.state;

        return (
            <div className="second-panel">
                <Header title="Overview"></Header>
                <div className="btn-container">
                    {btnStatus.map(
                        (e, i) => (<CircleBtn key={'btn-' + i} type={i} active={btnStatus[i]}
                            onClick={() => this.clickBtn(i)} />)
                    )}
                </div>
                <div className="content-panel">
                    {
                        grid.map((item, i) => {
                            return (
                                <div className="grid-line" key={'line-' + i}>
                                    <FlowerContainer
                                        leaves={item.property} current={item.size} next={item.next}
                                        _ratio={i === 0 ? 1 : item.size / grid[i - 1].size}
                                        _showUpLine={i !== 0}
                                        _selected={item && item.selected}
                                        _nextSelected={item.next !== -1 && grid[i + 1].selected}
                                        titles={item.titles}
                                        positions={item.positions}
                                        step={item.step}
                                        cb={this.clickFlower}
                                        _hovered={i === hoverIndex[0] ? hoverIndex[1] : -1}
                                    />
                                </div>
                            )
                        })
                    }
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
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        addStep: () => dispatch(addStep()),
        setOtherStep: (key, step) => dispatch(setOtherStep(key, step)),
        updateTopicView: data => {
            // console.log('topic');
            return dispatch(updateTopicView(data))
        },
        updateTimeLine: data => dispatch(updateTimeLine(data)),
        updateMatrix: data => dispatch(updateMatrix(data)),
        updateSelectList: data => dispatch(updateSelectList(data))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SecondPanel);