import React from 'react';

import './matrixChart.css';
import { MatrixPaint , matrixData} from './matrixPaint'
import MatrixButton from '../button/MatrixButton'
import VerticalSlider from '../verticalSlider/VerticalSlider'

// 暂时的假数据


class Matrix extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      // val:0,
      btnClassName:["","choose_btn",""]
    }
    this.$container = React.createRef();
    this.onhandleClick = this.onhandleClick.bind(this)
  }

  onhandleClick(v){
    let classList = v.target.className.split(" ")
    let index = v.target.id.split("")[0]
    // 如果点击的按钮不是当下选中的按钮
    if(classList.indexOf("choose_btn")==-1){
      v.target.className="choose_btn"
      let tempClassName=["","",""]
      tempClassName[index]="choose_btn"
      this.setState({
        btnClassName:tempClassName
      })
    }
  }
  componentWillUpdate(){
    let containerDom_u = this.$container.current;
    console.log("update中",containerDom_u)
  }
  componentDidMount(){
    let containerDom = this.$container.current;
    console.log("did中",containerDom)
    let labels = ['SuShi', 'WangAnshi', 'SuZhe', 'OuYangxiu', 'ZhengXie', 'SuShi', 'WangAnshi', 'SuZhe', 'OuYangxiu', 'ZhengXie','SuShi', 'WangAnshi', 'SuZhe', 'OuYangxiu', 'ZhengXie'];
    let width = Math.min(containerDom.clientWidth,containerDom.clientHeight)

    MatrixPaint({
      width:width,
      container : containerDom,
      data      : matrixData,
      labels    : labels,
      start_color : 'red',
      end_color : 'rgb(3, 93, 195)'
    });
  }
  render(){
    const btnData = [{btnName:"comp"},
        {btnName:"senti"},
        {btnName:"quantity"}
    ]
    let containerDom_r = this.$container.current;
    console.log("render()中",containerDom_r)
    return (
      <div className="chart-wrapper">
        <div className="header-line">
          <div className="title">People Matrix View</div>
          <div className="mButtonContainer" onClick={this.onhandleClick}>
            {btnData.map((v,i)=>(
              <MatrixButton key={v.btnName} id={`${i}_btn`}  btnName={v.btnName} cName={this.state.btnClassName[i]}></MatrixButton>))}
          </div>
        </div>
        
        <div ref={this.$container} className="matrix-container"></div>
        <VerticalSlider></VerticalSlider>
      </div>
      
    )
  }
}

export default Matrix;
