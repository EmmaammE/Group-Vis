import React from 'react';
import './verticalSlider.css';
import { connect } from 'react-redux';
import {updateTopicWeight} from '../../redux/topicWeight.redux.js'

class VerticalSlider extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
    this.$container = React.createRef();
    // this.handleInput = this.handleInput.bind(this)
  }

  componentDidMount(){
  }

  render(){
    let weight = this.props.weight;
    let top = this.props.top;
    let width = this.props.height
    let topic = this.props.topic
    let handleSliderInput = this.props.handleSliderInput
    let index = this.props.index
    // console.log("value,top,height",value,top,width)
    let style={
      top:top,
      height:width*0.20,
      width:width*1
    }
    return (
      <div className="columnSlider" style={style}>
        {/* <p ref={this.$lable} id = "cs_lable">0.5</p> */}
        <input onInput={handleSliderInput} ref={this.$container} index={index} orient="vertical" id="reachWeight" type="range" min="0" max="1" step = '0.1' defaultValue={weight} className="slider"/> 
        {/* <p id="cs_theme">ColumnSlider</p> */}
      </div>
    )
  }
}

export default connect(()=>({}),{updateTopicWeight})(VerticalSlider);
