import React from 'react';
import './fourthPanel.css';
import Header from '../../component/header/Header';
import TimeLine from '../../component/timeLine/TimeLine'
import SelectList from '../../component/selectList/SelectList'
import MatrixView from '../../component/matrix/matrixView/MatrixView'
import MapContainer from '../../component/map/MapContainer';

class FourthPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      
    }
    this.$container = React.createRef()
    this.hideAndShow = this.hideAndShow.bind(this)
  }
  hideAndShow(e){
    // console.log(e)
    let className  = e.target.parentNode.classList
    let selectListDom = this.$container.current
    if(className.contains("active")){
      className.remove("active")
      selectListDom.classList.remove("visible")
    }else{
      className.add("active")
      selectListDom.classList.add("visible")
    }
    


  }
  render() {
    return (
      <div className="fourth-panel">
        <Header title = "Auxiliary Views"></Header>
        <div className="fourth-panel-arrow">
          <div className="arrow" onClick={this.hideAndShow}></div>
        </div>
        <div 
          ref = {this.$container}
          className = "fourth-panel-selectlist">
          <SelectList/>
        </div>
        <div className="content-panel">
          <div className="box"><TimeLine/></div>
          <div className="matrix-box "><MatrixView/></div>
          <div className="mapContainer-box"><MapContainer /></div>
        </div>
      </div>
    )
  }
} 
export default FourthPanel;