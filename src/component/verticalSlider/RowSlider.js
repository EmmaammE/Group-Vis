import React from 'react';
import './verticalSlider.css';
// import { connect } from 'react-redux';
// import {updateTopicWeight} from '../../redux/topicWeight.redux.js'


let weight

class RowSlider extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
    this.$container = React.createRef();
    
  }
  componentDidUpdate(){
    let slider = this.$container.current
    let tempWeight = Number(this.props.weight).toFixed(0)
    tempWeight=tempWeight>100?100:weight
    // 表明是props变化带来的更新，否则则是：调节滑块带来的更新
    // if(tempWeight!=weight){
      slider.value = tempWeight
      // slider.defaultValue =tempWeight
      slider.style.backgroundSize = `${tempWeight}% 100%`
      
    // }
  }

  render(){
    weight = Number(this.props.weight).toFixed(0);
    weight=weight>100?100:weight
    let topicName = this.props.topicName
    let handleSliderInput = this.props.handleSliderInput
    let style={
      backgroundSize:`${weight}% 100%`
    }
    return (
      <div className="rowSliderContainer" >
        <div id="leftName">{"Topic weight: "}</div>
        <div id="middleInput">
          <input 
            id="rowSlider" 
            style={style} 
            className="row_slider_input" 
            onInput={handleSliderInput} 
            ref={this.$container} 
            type="range" 
            min="0" 
            max="100" 
            step ='2' 
            defaultValue={weight} />
        </div >
      </div>
    )
  }
}

export default RowSlider;
