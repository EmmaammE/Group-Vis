import React from 'react';
import './thirdPanel.css';
import Header from '../../component/header/Header';
import CircleBtn from '../../component/button/circlebtn';
import TopicViewChart from '../../component/topicView/TopicViewChart'
import TopicView from '../../component/topic/TopicView'
import btn4 from '../../assets/list.svg';
import btn3 from '../../assets/matrix.svg';
import btn2 from '../../assets/topic.svg';
import btn1 from '../../assets/map.svg';
import DimensionContainer from '../../component/dimension/DimensionContainer';

const btn_urls = [btn1,btn2,btn3,btn4]

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
          <div className="btn-container">
              {btn_urls.map((url,i)=>(<CircleBtn key={url+'-'+i} url={url} />))}
          </div>
          <div className="chart-panel">
            <TopicView></TopicView>
            {/* <TopicViewChart></TopicViewChart> */}
          </div>
        </div>
        <div className="xxxx-view">
          <DimensionContainer />
        </div>
      </div>
    )
  }
} 
export default ThirdPanel;