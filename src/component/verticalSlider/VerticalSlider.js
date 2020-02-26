import React from 'react';
import './verticalSlider.css';

class VerticalSlider extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
    this.$container = React.createRef();
    this.$lable = React.createRef();
  }

  componentDidMount(){
    let slider = this.$container.current;
    let csLable = this.$lable.current;
    slider.addEventListener('input', function(e) {

      csLable.innerHTML = e.target.value;
      let temp = e.target.value
      // 填充滑块有值部分，backgound-size转化为驼峰命名的方法
      slider.style.backgroundSize = `${temp}% 100%`
      temp =temp-5
      temp=temp>0?temp:0
      csLable.style.paddingLeft = `${temp}%`
      
    });
  }

  render(){
    return (
      <div className="columnSlider">
        <div className="sideNumber">0</div>
        <div>
            <p ref={this.$lable} id = "cs_lable">50</p>
            <input ref={this.$container} orient="vertical" id="reachWeight" type="range" min="0" max="100" step = '5' defaultValue="50" className="slider"/> 
            <p id="cs_theme">ColumnSlider</p>
        </div>
        <div className="sideNumber">100</div>
      </div>
    )
  }
}

export default VerticalSlider;
