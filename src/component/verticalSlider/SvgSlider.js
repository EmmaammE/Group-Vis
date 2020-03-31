import React from 'react';
import './verticalSlider.css';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import {updateTopicWeight} from '../../redux/topicWeight.redux.js'



class SvgSlider extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
    this.$container = React.createRef();
  }

  componentDidMount(){
    let container = this.$container.current
    let svg =  d3.select(container)
  }


  render(){
    let weight = this.props.weight;
    let width = this.props.width
    let height = this.props.height
    weight= weight>100?100:weight
    let sHeight = Number((height*(weight/100)).toFixed(0))
    let index = this.props.index
    let handleMouseDown = this.props.onMouseDown
    let handleMouseMove = this.props.onMouseMove
    let handleMouseUp = this.props.onMouseUp
    let handleMouseOut = this.props.onMouseOut
    return (
      <g className="svg_slider" transform={`translate(3,15)`} >
        <rect 
          rx={width/2}
          ry = {width/2}
          fill="#ffffff"
          stroke="#333333"
          strokeWidth="0.5"
          height = {height}
          width = {width}>
        </rect>
        <rect
          rx={width/2}
          ry = {width/2}
          width={width}
          height = {sHeight}
          fill="#dddddd"
        >
        </rect>
        <circle
          onMouseDown = {handleMouseDown}
          onMouseMove = {handleMouseMove}
          onMouseUp = {handleMouseUp}
          onMouseOut = {handleMouseOut}
          className="svg_slider_thumb"
          r={width/2+1.5}
          stroke="#888888"
          strokeWidth="0.5"
          index={index}
          ref={this.$container}
          cx = {width/2}
          cy = {sHeight}
          fill="#dddddd"

        >
        </circle>
      </g>
    )
  }
}

export default connect(()=>({}),{updateTopicWeight})(SvgSlider);
