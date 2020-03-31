import React from 'react';
import './fourthPanel.css';
import Header from '../../component/header/Header';
import TimeLine from '../../component/timeLine/TimeLine'

import MatrixView from '../../component/matrix/matrixView/MatrixView'
import MapContainer from '../../component/map/MapContainer';

class FourthPanel extends React.Component {
  render() {
    return (
      <div className="fourth-panel">
        <Header title = "Details view"></Header>
        <div className="content-panel">
          <div className="box"><TimeLine/></div>
          <div className="box"><MatrixView/></div>
          <div className="box"><MapContainer /></div>
        </div>
      </div>
    )
  }
} 
export default FourthPanel;