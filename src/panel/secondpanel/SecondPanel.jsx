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
import { initTopicWeight } from '../../redux/topicWeight.redux';
import {addHistoryData} from '../../redux/history.redux';
import LEGEND from '../../assets/legend/flower.png';

const GRID_ITEM_TEMPLATE = { next: -1, size: 0, property: [], selected: -1 };
class SecondPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // grids: [],
            grid: [],
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
            let { grid, step2index, hoverIndex, lastHoverIndex } = this.state;
            let { group, step, groups } = this.props;

            // let grid = grids[groups-1] ? grids[groups-1]: [];
            // console.log(groups)
            // group = group[groups]
            // let grid = grids;
            if (grid.length === 0) {
                // console.log('update init');
               
                // let titles = [], weights = [];
                // let data = [];
                // group[1][TOPICS].forEach(e => {
                //     titles.push(e['content']);
                //     weights.push(e['weight'])
                // })
                // group[1][TOPICS].forEach(e => {
                //     titles.push(e['content']);
                //     weights.push(e['weight'])
                // })
                

                let newGrid = [({
                    ...GRID_ITEM_TEMPLATE, size: 1, selected: 0, step: [1],
                    // property: [weights], titles: [titles], 
                    positions: [group[1][POSITIONS]], data: [group[1][TOPICS]]
                })]

                // grids[groups-1] = newGrid;
                // this.setState({ grids: newGrid})
                this.setState({ grid: newGrid})

            } else {
                let newGrid = grid.slice(0);

                let currentLayer = hoverIndex[0];
                let lastIndex = step2index[step - 1];

                if(lastHoverIndex !== undefined) {
                    lastIndex = step2index[lastHoverIndex]
                }

                let titles = [], weights = [];
                group[step][TOPICS].forEach(e => {
                    titles.push(e['content']);
                    weights.push(e['weight']);
                })
                
                // 被选中的这朵❀没有下一层
                if (currentLayer === grid.length-1) {
                    newGrid[lastIndex[0]].next = 1;
                    newGrid.push({
                        ...GRID_ITEM_TEMPLATE, size: 1, step: [step],
                        positions: [group[step][POSITIONS]],
                        data: [group[step][TOPICS]]
                        // property: [weights], titles: [titles],
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
                    // _grid.property.push(weights);
                    // _grid.titles.push(titles) ;
                    _grid.positions.push(group[step][POSITIONS]);
                    _grid.step.push(step);
                    _grid.data.push(group[step][TOPICS])
                }

                // grids[grid] = newGrid

                this.setState({
                    // grids: newGrid,
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


        // step为被选中的❀的step
        switch (i) {
            case 0:
                // TimeLine
                
                break;
            case 1:
                // Matrix
                

                break;
            case 2:
                // map
                break;
            case 3:
                // selectList
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
        let { grid, gridBack, hoverIndex  } = this.state;

        let hasNext = false;
        // 如果选中的这一层已经有了下一层，且不是在该花朵所在的层选择该花朵时创建的
        if(thisIndex[0]+1 <= grid.length-1 && grid[thisIndex[0]].selected!==thisIndex[1]) {
            // 当前被选中的step 
            hasNext = true;
            gridBack[hoverIndex[2]] = grid.slice(thisIndex[0]+1);
            grid = grid.slice(0, thisIndex[0]+1);
            grid[thisIndex[0]].next = -1;
        }
        // 如果该🌼已有备份
        if(gridBack[step]!==undefined && grid[thisIndex[0]].selected!==thisIndex[1]) {
            // 如果选中该❀前，同层的❀已有下一层
            if(hasNext === true) {
                grid = grid.slice(0, thisIndex[0]+1);
            }
            gridBack[step].forEach(e => {
                grid.push(e)
            })
            grid[thisIndex[0]].next = gridBack[step][0].size;
        }
       
        // 更新选中的序号
        grid[thisIndex[0]].selected = thisIndex[1];
        
        this.updateViews(step);

        this.setState({
            grid,
            lastHoverIndex: step,
            hoverIndex: [...thisIndex, step],
            btnStatus: new Array(4).fill(false)
        })
    }

    updateViews(step) {
        let { group, updateTimeLine, updateMatrix, updateSelectList, updateTopicView, addHistoryData, setOtherStep } = this.props;
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

    render() {
        let { grid, btnStatus, hoverIndex } = this.state;

        return (
            <div className="second-panel">
                <Header title="Overview"></Header>
                
                <div className="content-panel">
                    <div className="legend-container">
                        <img src={LEGEND} alt="" />
                    </div>
                    {
                        // grids.map((grid, j) => {
                        //     return (
                        //         <div className="grids-content" key={'grids-'+j}>
                                // {
                                    grid.map((item, i) => {
                                        if(item) {
                                            // console.log(item)
                                            // let size = 80%current;
                                            return (
                                                <div className="grid-line" key={'line-' + i}
                                                    style={{width:80*item.size+'%',
                                                        paddingLeft: (item.size-1)*25+'%'
                                                    }}
                                                >
                                                    <FlowerContainer
                                                        step={item.step}
                                                        leaves={item.data} 
                                                        current={item.size} 
                                                        next={item.next}
                                                        // _ratio={i === 0 ? 1 : item.size / grid[i - 1].size}
                                                        // _showUpLine={i !== 0}
                                                        _selected={item && item.selected}
                                                        _nextSelected={grid[i + 1] && grid[i + 1].selected}
                                                        _hovered={i === hoverIndex[0] ? hoverIndex[1] : -1}
                                                        // titles={item.titles}
                                                        positions={item.positions}
                                                        cb={this.clickFlower}
                                                    />
                                                </div>
                                            )
                                        } else {
                                            return null
                                        }
                                    })
                                // }
                            //     </div>
                            // )
                        // })
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
        groups: state.groups
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
        updateSelectList: data => dispatch(updateSelectList(data)),
        initTopicWeight: data => dispatch(initTopicWeight(data)),
        addHistoryData:data=>dispatch(addHistoryData(data))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SecondPanel);