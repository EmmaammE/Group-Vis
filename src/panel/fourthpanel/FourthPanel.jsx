import React from 'react';
import './fourthPanel.css';
import Header from '../../component/header/Header';
import CircleBtn from '../../component/button/circlebtn';

import btn4 from '../../assets/list.svg';
import btn3 from '../../assets/matrix.svg';
import btn2 from '../../assets/topic.svg';
import btn1 from '../../assets/map.svg';

const btn_urls = [btn1,btn2,btn3,btn4]

class FourthPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    return (
      <div className="fourth-panel">
        <Header title = "Overview"></Header>
        <div className="timeLine-view">
          timeLine-view
        </div>
        <div className="lower-charts">
          <div className="left-charts">
            <div className ="matrix-view">matrix-view</div>
            <div className = "map-view">map-view</div>
          </div>
          <div className="select-list">select-list</div>
        </div>
      </div>
    )
  }
} 
export default FourthPanel;