import React from 'react';
import './secondPanel.css'
import Header from '../../component/header/Header';
import CircleBtn from '../../component/button/circlebtn';
import FlowerContainer from '../../component/flower/flowerContainer';
import { setStep, setGroup} from '../../actions/step';
import { connect } from 'react-redux';

import btn4 from '../../assets/list.svg';
import btn3 from '../../assets/matrix.svg';
import btn2 from '../../assets/topic.svg';
import btn1 from '../../assets/map.svg';

const genData = () => {
    return 1 + Math.random() * 8;
}

function random(min, max) {
    return min + Math.random() * (max - min);
  }
const genItem = (num,property) => ({
    next: -1,
    size: num,
    property: Array(num).fill(property),
    selected: 0
})
const btn_urls = [btn1,btn2,btn3,btn4]

const GRID_ITEM_TEMPLATE = {next:-1, size:0, property:[], selected:-1};
class SecondPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            grid: [
                // {next:-1, size:1, property:[4],selected:0},
                // {next:-1, size:2, property:[8,9],selected:0},
                // {next:4, size:3, property:[7,9,10],selected:2},
                // {next:-1, size:4, property:[7,7,5,10],selected:2},
            ],
            hoverIndex:[1,1]
        }
        this.toSelect = this.toSelect.bind(this);
    }   

    // toSelect
    toSelect() {
        console.log('...');
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
        this.props.setGroup({[_a]:(10-_a)*100})
    }

    componentDidUpdate(prevProps){
        if(JSON.stringify(prevProps["all_topics"]) !== JSON.stringify(this.props["all_topics"])) {
            let {grid} = this.state;
            let {all_topics} = this.props;
            // 第一朵花
            if(grid.length === 0) {
                grid.push({...GRID_ITEM_TEMPLATE, size:1, 
                    property:[all_topics.length], titles:all_topics, positions: this.props.positions})
                this.setState({grid})
            }
        }
    }

    render() {
        // let {grid,hoverIndex} = this.state;
        let {grid} = this.state;
        
        return (
            <div className="second-panel">
                <Header title="Overview"></Header>
                <div className="btn-container">
                    {btn_urls.map(url=>(<CircleBtn key={url} url={url} />))}

                    <div style={{background:'#f00'}}onClick={this.toSelect}>筛选</div>
                </div>
                <div className="content-panel">
                {
                    grid.map((item, i)=> {
                        return (
                            <div className="grid-line" key={'line-'+i}>
                                <FlowerContainer 
                                    leaves={item.property} current={item.size} next={item.next}
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
        all_topics: state.topicData["all_topics"],
        step: state.step,
        positions: state.topicData["person2positions"]
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setStep: step => dispatch(setStep(step)),
        setGroup: group => dispatch(setGroup(group))
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(SecondPanel);