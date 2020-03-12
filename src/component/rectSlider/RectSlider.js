import React from 'react';


const imgStyle = {
  display: "inline",
  cursor: 'pointer',
}

class RectSlider extends React.Component{
  constructor(props){
    super(props);
    this.state={
      
    }
  }

  render(){
    let yScale =this.props.yScale
    let index = this.props.index
    let height = this.props.height*0.6
    height = height>70?70:height;
    height = height<50?50:height;
    let value = this.props.value
    return (
      <g  
        className="rect_slider"
        transform={`translate(0,${yScale(index)-height*0.5})`}
      >
        <rect
          className="outer_rect_slider"
          width="4"
          height={height}
          rx="1"
          ry="3"
          fill="white"
          stroke="gray"
          strokeWidth="0.5"
        >
        </rect>
        <rect
          className="inner_rect_slider"
          transform={`translate(0,${height-value*height})`}
          width="4"
          height={value*height}
          rx="1"
          ry="3"
          stroke="gray"
          strokeWidth="0.2"
          fill="#dddddd"

        >
        </rect>
      </g>
    )
  }
}
export default RectSlider;