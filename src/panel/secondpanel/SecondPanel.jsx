import React from 'react';
import './secondPanel.css'
import Header from '../../component/header/Header';
import CircleBtn from '../../component/button/circlebtn';
import FlowerContainer from '../../component/flower/flowerContainer';
import { addStep, setOtherStep} from '../../actions/step';
import { TOPICS, POSITIONS} from '../../util/name';
import { connect } from 'react-redux';

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

const GRID_ITEM_TEMPLATE = {next:-1, size:0, property:[], selected: 0};
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
            hoverIndex:[1,1],
            btnStatus: [false, false, false, false]
        }
        this.toSelect = this.toSelect.bind(this);
        this.clickBtn = this.clickBtn.bind(this);
    }   

    // toSelect
    toSelect() {
        let num = parseInt(genData());
        let newGridItem = genItem(num,parseInt(random(6,9)));
        let {grid} = this.state;
        // hoverIndex[1]
        grid[grid.length-1].next = num;
        grid.push(newGridItem)
        this.setState({
            grid
        })

        this.props.setStep(num);
        let _a = grid.length-1
        this.props.setGroup({[_a]:_a*200})
    }

    componentDidUpdate(prevProps){
        if(prevProps.step !== this.props.step) {
            let {grid} = this.state;
            let {group} = this.props;
            // TODO: ❀和grid序号的映射
        
            // 暂定8片花瓣
            let titles = group[1][TOPICS].slice(0,8).map(arr => arr[1]);
            grid.push({...GRID_ITEM_TEMPLATE, size:1, 
                    property:[titles.length], titles: titles, positions: group[1][POSITIONS]})
            this.setState({grid})
        }
    }

    clickBtn(i) {
        let { btnStatus, step } = this.state;
        this.props.setOtherStep(7+i, 1);
        btnStatus[i] = !btnStatus[i];

        this.setState({
            btnStatus
        })
    }

    render() {
        // let {grid,hoverIndex} = this.state;
        let {grid, btnStatus} = this.state;
        
        return (
            <div className="second-panel">
                <Header title="Overview"></Header>
                <div className="btn-container">
                    {btnStatus.map(
                        (e,i) => (<CircleBtn key={'btn-'+i} type={i} active = {btnStatus[i]}
                            onClick={() => this.clickBtn(i)} />)
                    )}
                    {/* <div style={{background:'#f00'}} onClick={this.toSelect}>筛选</div> */}
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
                                    _selected = {item.selected}
                                    _nextSelected = {item.next!==-1 && grid[i+1].selected}
                                    titles = {item.titles}
                                    positions = {item.positions}
                                    // _hovered = {i===hoverIndex[0]?hoverIndex[1]:-1}
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
        group: state.group
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        addStep: () => dispatch(addStep()),
        setOtherStep: (key, step) => dispatch(setOtherStep(key, step))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(SecondPanel);