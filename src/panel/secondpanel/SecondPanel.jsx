import React from 'react';
import './secondPanel.css'
import Header from '../../component/header/Header';
import CircleBtn from '../../component/button/circlebtn';
import FlowerContainer from '../../component/flower/flowerContainer';

import btn4 from '../../assets/list.svg';
import btn3 from '../../assets/matrix.svg';
import btn2 from '../../assets/topic.svg';
import btn1 from '../../assets/map.svg';

const btn_urls = [btn1,btn2,btn3,btn4]
class SecondPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            grid: [
                {next:2, size:1, property:[7],selected:0},
                {next:3, size:2, property:[8,9],selected:0},
                {next:4, size:3, property:[7,9,10],selected:2},
                {next:-1, size:4, property:[7,7,5,10],selected:2},
            ],
            hoverIndex:[3,2]
        }
    }

    render() {
        let {grid,hoverIndex} = this.state;
        return (
            <div className="second-panel">
                <Header title="Overview"></Header>
                <div className="btn-container">
                    {btn_urls.map(url=>(<CircleBtn key={url} url={url} />))}
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

export default SecondPanel;