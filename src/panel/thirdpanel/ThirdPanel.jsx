import React from 'react';
import './thirdPanel.css';
import Header from '../../component/header/Header';

// import TopicViewChart from '../../component/topicView/TopicViewChart'
// import TopicView from '../../component/topic/TopicView'
import TopicTreeMap from '../../component/topicTreeMap/TopicTreeMap.js'
import DimensionContainer from '../../component/dimension/DimensionContainer';



class ThirdPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    return (
      <div className="third-panel">
        <Header title = "Figure-level Analyzer"></Header>
        <div className="topicView-panel">
            <TopicTreeMap></TopicTreeMap>
        </div>
        <div className="third-footer-panel">
          <div className = "third-footer">
            <p className="g-chart-title">Figure View</p>
            <DimensionContainer />
          </div>
        </div>
      </div>
    )
  }
} 
export default ThirdPanel;