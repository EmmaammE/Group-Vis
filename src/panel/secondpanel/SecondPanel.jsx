import React from 'react';
import './secondPanel.css'
import Header from '../../component/header/Header';
import CircleBtn from '../../component/button/circlebtn';
import FlowerContainer from '../../component/flower/flowerContainer';
import { addStep, setOtherStep} from '../../actions/step';
import { TOPICS, POSITIONS} from '../../util/name';
import { connect } from 'react-redux';
import { GridHistory } from './gridHistory';

const genData = () => {
    return 2 + Math.random() * 4;
}

function random(min, max) {
    return min + Math.random() * (max - min);
  }
const genItem = (num,property) => ({
    next: -1,
    size: num,
    property: Array(num).fill(property),
    selected: 0,
    positions: []
})

const GRID_ITEM_TEMPLATE = {next:-1, size:0, property:[], selected: -1};
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
            hoverIndex:[0,0,0],
            btnStatus: [false, false, false, false],
            // step: [第几层，第几个]
            step2index:{1:[0,0]},
            gridHistory: new GridHistory(),
            gridLength: 0
        }
        this.clickBtn = this.clickBtn.bind(this);
        this.clickFlower = this.clickFlower.bind(this);
    }   

    componentDidUpdate(prevProps){
        if(JSON.stringify(prevProps.group) !== JSON.stringify(this.props.group)) {
        // if(prevProps.step !== this.props.step) {
            let {grid,step2index,gridHistory,gridLength} = this.state;
            let {group, step} = this.props;

            try {
                // TODO: ❀和grid序号的映射
            if(grid.length === 0 || this.props.step === 1) {
                console.log('update init');
                // 暂定8片花瓣
                let titles = group[1][TOPICS].slice(0,8).map(arr => arr[1]);
                let newGrid = [({...GRID_ITEM_TEMPLATE, size:1, selected: 0, step: [1],
                        property:[titles.length], titles: titles, positions: [group[1][POSITIONS]]})]

                gridHistory = new GridHistory();
                gridHistory.add(newGrid.slice(0));
                this.setState({grid: newGrid, gridHistory, gridLength:1})
            } else {
                let newGrid = grid.slice(0);
                let titles = group[step][TOPICS].slice(0,8).map(arr => arr[1]);

                // 是否要进入下一层
                let lastIndex = step2index[step-1];
                if(lastIndex[0] === 0 ||grid[lastIndex[0]].selected!==-1) {
                    newGrid[lastIndex[0]].next = 1;
                    // 开始下一级
                    newGrid.push({...GRID_ITEM_TEMPLATE, size:1, step: [step],
                        property:[titles.length], titles: titles, positions: [group[step][POSITIONS]]});
                    // step2index[step] = [1,0];
                    step2index[step] = [lastIndex[0]+1, 0];
                } else {
                    newGrid[lastIndex[0]-1].next += 1;
                    // 还是在这一层, 是这一层的第newIndex个
                    let newIndex = lastIndex[1] + 1;
                    step2index[step] = [lastIndex[0], newIndex];
                    
                    let _grid = newGrid[lastIndex[0]];
                    _grid.size += 1;
                    _grid.property.push(titles.length);
                    _grid.titles = titles;
                    _grid.positions.push(group[step][POSITIONS]);
                    _grid.step.push(step);
                }

                gridHistory.add(newGrid.slice(0));
                this.setState({
                    grid: newGrid,
                    step2index,
                    gridHistory,
                    gridLength: gridLength+1
                })
            }
            } catch {
                console.log('...');
            }
        }
        
        if(prevProps.countedLayer !== this.props.countedLayer) {
            this._updateCountedLayer();
        }
    }

    _updateCountedLayer() {
        // countedLayer: 现在保留的步数
        let {countedLayer, step} = this.props;
        let {gridHistory, gridLength} = this.state;
        let remove = gridLength - countedLayer;
        if(remove > 0) {
            gridHistory.undo(remove);
            console.log('undo:', remove);
            // console.log(gridHistory.present);
            let grid = gridHistory.present;
            for(let i=0;i<grid.length;i++) {
                if(i+1 >= grid.length) {
                    // 没有下一个了
                    grid[i].next = -1;
                }
                grid[i].size = grid[i].step.length;
            }
            this.setState({
                grid,
                gridHistory,
                gridLength: gridLength-remove
            })
        } else {
            gridHistory.redo(-remove);
            this.setState({
                grid: gridHistory.present,
                gridHistory,
                gridLength: gridLength+remove
            })
        }
    }

    clickBtn(i) {
        let { btnStatus, hoverIndex } = this.state;
        // step为被选中的❀的step
        this.props.setOtherStep(7+i, hoverIndex[2]);
        btnStatus[i] = !btnStatus[i];
 
        this.setState({
            btnStatus
        })
    }

    clickFlower(step) {
        let thisIndex = this.state.step2index[step];
        // 设置这一层的selected
        let {grid} = this.state;
        grid[thisIndex[0]].selected = thisIndex[1];
        
        this.props.setOtherStep(6, step);
        // console.log(step);
        this.setState({
            grid,
            hoverIndex: [...thisIndex, step]
        })
    }

    render() {
        let {grid, btnStatus, hoverIndex} = this.state;
        
        return (
            <div className="second-panel">
                <Header title="Overview"></Header>
                <div className="btn-container">
                    {btnStatus.map(
                        (e,i) => (<CircleBtn key={'btn-'+i} type={i} active = {btnStatus[i]}
                            onClick={() => this.clickBtn(i)} />)
                    )}
                </div>
                <div className="content-panel">
                {
                    grid.map((item, i)=> {
                        return (
                            <div className="grid-line" key={'line-'+i}>
                                <FlowerContainer 
                                    leaves={item.property} current={item.size} next={item.next}
                                    _ratio = {i===0?1:item.size/grid[i-1].size}
                                    _showUpLine = {i!==0}
                                    _selected = {item && item.selected}
                                    _nextSelected = {item.next!==-1 && grid[i+1].selected}
                                    titles = {item.titles}
                                    positions = {item.positions}
                                    step = {item.step}
                                    cb = {this.clickFlower}
                                    _hovered = {i===hoverIndex[0]?hoverIndex[1]:-1}
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
        // _selectedPerson: state.matrixView && state.matrixView["matrixPerson"],
        // _peopleFrom6: state.people
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        addStep: () => dispatch(addStep()),
        setOtherStep: (key, step) => dispatch(setOtherStep(key, step))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(SecondPanel);