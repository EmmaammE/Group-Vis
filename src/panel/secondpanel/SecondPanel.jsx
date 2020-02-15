import React from 'react';
import './secondPanel.css'
import Header from '../../component/header/Header';
import Flower from '../../component/flower/flower';
import CircleBtn from '../../component/button/circlebtn';

class SecondPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            grid: [[7],[8,9],[7,9,10],[7,7,5,10]]
        }
    }

    render() {
        let {grid} = this.state;
        return (
            <div className="second-panel">
                <Header title="Overview"></Header>
                <div className="btn-container">
                    <CircleBtn />
                </div>
                {
                    grid.map((arr, i)=> {
                        let items = arr.map((item, j) => (
                            <Flower key={`flower-${i}-${j}`} number={item} />
                        ))
                        return <div className="grid-line" key={'line-'+i}>{items}</div>
                    })
                }
                <svg viewBox="0 0 40 100" className="lines">
                    {/* <line x1="0" y1="0" x2="40" y2="100" stroke="black" /> */}
                </svg>
            </div>
        )
    }
}

export default SecondPanel;