import React from 'react';
import './secondPanel.css'
import Header from '../../component/header/Header';
import Flower from '../../component/flower/flower';

class SecondPanel extends React.Component {

    render() {
        return (
            <div className="second-panel">
                <Header title="Overview"></Header>
                <Flower number={7} />
            </div>
        )
    }
}

export default SecondPanel;