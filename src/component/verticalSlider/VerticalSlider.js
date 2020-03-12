import React from 'react';
import './verticalSlider.css';

class VerticalSlider extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
    this.$container = React.createRef();
    // this.$lable = React.createRef();
  }

  componentDidMount(){
    let slider = this.$container.current;
    // let csLable = this.$lable.current;
    slider.addEventListener('input', function(e) {

      // csLable.innerHTML = e.target.value;
      let temp = e.target.value
      // 填充滑块有值部分，backgound-size转化为驼峰命名的方法
      slider.style.backgroundSize = `${temp*100}% 100%`
      // temp =temp-5
      // temp=temp>0?temp:0
      // csLable.style.marginLeft = `${temp*100}%`
      
    });
  }

  render(){
    let value = this.props.value;
    let top = this.props.top;
    let width = this.props.height
    // console.log("value,top,height",value,top,width)
    let style={
      top:top,
      height:width*0.20,
      width:width*1
    }
    return (
      <div className="columnSlider" style={style}>
        {/* <p ref={this.$lable} id = "cs_lable">0.5</p> */}
        <input ref={this.$container} orient="vertical" id="reachWeight" type="range" min="0" max="1" step = '0.1' defaultValue={value} className="slider"/> 
        {/* <p id="cs_theme">ColumnSlider</p> */}
      </div>
    )
  }
}

export default VerticalSlider;
