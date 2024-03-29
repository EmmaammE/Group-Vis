import React from 'react';
import * as d3 from 'd3';
import './timeLineChart.css';
import {TimeLine, circleData}from './timeLine'

class TimeLineChart extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
    this.$container = React.createRef();
  }

  componentDidMount(){
    let containerDom = this.$container.current;
    // console.log("containerDomkkk",containerDom)
    let width = containerDom.clientWidth;
    let height = containerDom.clientHeight;
    console.log("height",height,width)
    TimeLine({
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
        <div className="title">Timeline View</div>
        <div ref={this.$container} className="timeLine-container"></div>
      </div>
      
    )
  }
}

export default TimeLineChart;
