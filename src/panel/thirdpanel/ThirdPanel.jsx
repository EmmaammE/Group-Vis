import React from 'react';
import './thirdPanel.css';
import Header from '../../component/header/Header';

// import TopicViewChart from '../../component/topicView/TopicViewChart'
import TopicView from '../../component/topic/TopicView'

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
        <Header title = "Topicview"></Header>
        <div className="topicView-panel">
            <TopicView></TopicView>
            {/* <TopicViewChart></TopicViewChart> */}
        </div>
        <DimensionContainer />
      </div>
    )
  }
} 
export default ThirdPanel;