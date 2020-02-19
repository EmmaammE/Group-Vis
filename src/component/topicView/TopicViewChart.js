import React from 'react';
import * as d3 from 'd3';
import './topicViewChart.css';
import {TopicView, circleData}from './topicView'

class TopicViewChart extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
    this.$container = React.createRef();
  }

  componentDidMount(){
    let containerDom = this.$container.current;
    let width = containerDom.clientWidth;
    let height = containerDom.clientHeight;
    console.log("height",height,width)
    TopicView({
      width:width,
      height:height,
      container : containerDom,
      data      : circleData,
      start_color : 'rgb(3, 93, 195)',
      end_color : '#ff0000'
    });
  }
  render(){
    return (
      <div className="chart-wrapper">
        <div className="title">Topic View</div>
        <div ref={this.$container} className="topicViewChart-container"></div>
      </div>
      
    )
  }
}

export default TopicViewChart;
