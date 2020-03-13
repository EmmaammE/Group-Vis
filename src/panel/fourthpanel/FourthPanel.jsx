import React from 'react';
import './fourthPanel.css';
import Header from '../../component/header/Header';
import CircleBtn from '../../component/button/circlebtn';
import Matrix from '../../component/matrixChart/Matrix';
import TimeLine from '../../component/timeLine/TimeLine'

import MatrixView from '../../component/matrix/matrixView/MatrixView'
import TimeLineChart from '../../component/timeLineChart/TimeLineChart';
import SelectList from '../../component/selectList/SelectList';
import MapContainer from '../../component/map/MapContainer';

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
          <TimeLine></TimeLine>
          {/* <TimeLineChart></TimeLineChart> */}
        </div>
        <div className="lower-charts">
          <div className="left-charts">
            <div className ="matrix-view">
              <MatrixView></MatrixView>
              {/* <Matrix></Matrix> */}
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