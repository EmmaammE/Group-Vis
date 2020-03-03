import React from 'react';

import './matrixView.css';
import * as d3 from 'd3';
import {  matrixData} from './tempData'
import MatrixButton from '../../button/MatrixButton'
import VerticalSlider from '../../verticalSlider/VerticalSlider'
import MatrixColumn from '../matrixColumn/MatrixColumn'
import LeftLable from '../leftLable/LeftLable'
import scaleFactory from '../util/util'
// import 
// 暂时的假数据
const WIDTH = 270;
const HEIGHT = 270;
const START_COLOR = 'red'
const END_COLOR = 'rgb(3,93,195)' 

class MatrixView extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      // val:0,
      btnClassName:["","choose_btn",""]
    }
    // this.$container = React.createRef();
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
  render(){
    // xy是比例尺，因为是方型所以，横竖方向使用一个
    // colorMap是颜色比例尺
    let margin={left:50,top:50,right:10,bottom:20}
    let width = WIDTH-margin.left-margin.right
    let height = HEIGHT -margin.top-margin.bottom
    const {xy,colorMap}=scaleFactory(width,matrixData,START_COLOR,END_COLOR)
    const btnData = [{btnName:"comp"},
        {btnName:"senti"},
        {btnName:"quantity"}
    ]
    let labels = ['SuShi', 'WangAnshi', 'SuZhe', 'OuYangxiu', 'ZhengXie', 'SuShi', 'WangAnshi', 'SuZhe', 'OuYangxiu', 'ZhengXie','SuShi', 'WangAnshi', 'SuZhe', 'OuYangxiu', 'ZhengXie'];
    return (
      <div className="chart-wrapper">
        <div className="header-line">
          <div className="title">People Matrix View</div>
          <div className="mButtonContainer" onClick={this.onhandleClick}>
            {btnData.map((v,i)=>(
              <MatrixButton key={v.btnName} id={`${i}_btn`}  btnName={v.btnName} cName={this.state.btnClassName[i]}></MatrixButton>))}
          </div>
        </div>
        
        <div ref={this.$container} className="matrix-container">
          <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            <g transform="translate(-50,0)">
              <g className="matrix_lables" transform={`translate(${margin.left},${margin.top})`} >
                <LeftLable key={`lable_row`} rowOrColumn = {true} data={labels} xy={xy}></LeftLable>
                <LeftLable key={`lable_column`} rowOrColumn = {false} data={labels} xy={xy}></LeftLable>
              </g>
              <g className="matrix_columns" transform={`translate(${margin.left},${margin.top})`}>
                {
                  matrixData.map((v,i)=>(
                    <MatrixColumn data={v} index={i} xy={xy} colorMap={colorMap} key={i}></MatrixColumn>
                  ))
                }
              </g>
            </g>
            
          </svg>
        </div>
        <VerticalSlider></VerticalSlider>
      </div>
      
    )
  }
}

export default MatrixView;
