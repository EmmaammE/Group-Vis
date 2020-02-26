import React from 'react';
import './fourthPanel.css';
import Header from '../../component/header/Header';
import CircleBtn from '../../component/button/circlebtn';
import Matrix from '../../component/matrixChart/Matrix';
import TimeLineChart from '../../component/timeLineChart/TimeLineChart';
import SelectList from '../../component/selectList/SelectList';

import btn4 from '../../assets/list.svg';
import btn3 from '../../assets/matrix.svg';
import btn2 from '../../assets/topic.svg';
import btn1 from '../../assets/map.svg';
import MapContainer from '../../component/map/MapContainer';

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
          <TimeLineChart></TimeLineChart>
        </div>
        <div className="lower-charts">
          <div className="left-charts">
            <div className ="matrix-view">
              <Matrix></Matrix>
            </div>
            <div className = "map-view"><MapContainer /></div>
          </div>
          <div className="select-list">
            <SelectList></SelectList>
          </div>
        </div>
      </div>
    )
  }
} 
export default FourthPanel;