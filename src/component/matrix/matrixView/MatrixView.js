import React from 'react';

import './matrixView.css';
import * as d3 from 'd3';
import {  matrixData} from './tempData'
// import MatrixButton from '../../button/MatrixButton'
// import VerticalSlider from '../../verticalSlider/VerticalSlider'
import MatrixColumn from '../matrixColumn/MatrixColumn'
import LeftLable from '../leftLable/LeftLable'
import scaleFactory from '../util/util'
import { connect } from 'react-redux';


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
      tooltip:"tooltip",
      visibility:"hidden",
      x:"0",
      y:"0",
      targetWidth:10,
      highRowLabel:-1,
      highColLabel:-1
    }
    this.$container = React.createRef();
    this.handleMouseenter = this.handleMouseenter.bind(this)
    this.handleMouseout = this.handleMouseout.bind(this)
  }

  componentDidMount(){
    // let container = this.$container.current
    // let currentX = container.getBoundingClientRect().x
    // let currentY = container.getBoundingClientRect().y
    // this.setState({
    //   x:currentX,
    //   y:currentY
    // })
    // console.log("container",currentX,currentY)
  }

  handleMouseenter(v){
    if(v.target.localName=="rect"){
      // console.log("getbox",v.clientX,v.target.getBBox())
      let targetWidth = Number(v.target.getAttribute("width"));
      let infos = v.target.getAttribute("info").split("_")
      
      
      this.setState({
        tooltip:infos[2],
        visibility:"visible",
        targetWidth:targetWidth,
        highRowLabel:Number(infos[0]),
        highColLabel:Number(infos[1])
      })
    }
  }

  handleMouseout(v){
    this.setState({
      tooltip:"change",
      visibility:"hidden",
      highRowLabel:-1,
      highColLabel:-1
    })
    // v.target.setAttribute("fill",this.state.tooltip)
  }



  render(){
    // xy是比例尺，因为是方型所以，横竖方向使用一个
    // colorMap是颜色比例尺
    let margin={left:40,top:50,right:10,bottom:20}
    let width = WIDTH-margin.left-margin.right
    let height = HEIGHT -margin.top-margin.bottom
    const {xy,colorMap}=scaleFactory(width,matrixData,START_COLOR,END_COLOR)
    const btnData = [{btnName:"comp"},
        {btnName:"senti"},
        {btnName:"quantity"}
    ]
    let tipX = margin.left+xy(this.state.highRowLabel)+this.state.targetWidth
    let tipY = margin.top+xy(this.state.highColLabel)-this.state.targetWidth*2
    tipX = tipX ? tipX:0;
    tipY = tipY ? tipY:0;
    let labels = ['SuShi', 'WangAnshi', 'SuZhe', 'OuYangxiu', 'ZhengXie', 'SuShi', 'WangAnshi', 'SuZhe', 'OuYangxiu', 'ZhengXie','SuShi', 'WangAnshi', 'SuZhe', 'OuYangxiu', 'ZhengXie'];
    return (
      <div className="chart-wrapper">
        <div className="header-line">
          <div className="title">People Matrix View</div>
        </div>
        
        <div  className="matrix-container">
          <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} ref={this.$container}>
            <g transform="translate(-10,0)">
              {/* 绘制坐标轴 */}
              <g className="matrix_lables" transform={`translate(${margin.left},${margin.top})`} >
                <LeftLable 
                  key={`lable_row`} 
                  rowOrColumn = {true} 
                  data={labels} 
                  xy={xy}
                  highLable={this.state.highRowLabel}
                ></LeftLable>
                <LeftLable 
                  key={`lable_column`} 
                  rowOrColumn = {false} 
                  data={labels} 
                  xy={xy}
                  highLable={this.state.highColLabel}
                ></LeftLable>
              </g>
              {/* 绘制矩形块 */}
              <g 
                className="matrix_columns" 
                transform={`translate(${margin.left},${margin.top})`}
                onMouseEnter={this.handleMouseenter}
                onMouseOut = {this.handleMouseout}
              >
                {
                  matrixData.map((v,i)=>(
                    <MatrixColumn data={v} index={i} xy={xy} colorMap={colorMap} key={i}></MatrixColumn>
                  ))
                }
              </g >
              {/* 绘制tooltip */}
              <g 
                transform = {`translate(${tipX},${tipY})`}
                visibility={this.state.visibility}
              >
                <rect className="tooltip-g"
                  width="40"
                  height="15" 
                  opacity="0.5"
                  stroke="red"
                  strokeWidth="1"
                  fill="#ffffff">
                </rect>
                <text 
                  // transform = "scale(0.9)"
                  fill="red"
                  className="tooltip-rec"
                  y="10"
                  x="20"
                  z-index = "10"
                  textAnchor="middle"
                  fontSize="0.65em"
                >
                  {this.state.tooltip}
                </text>
              </g>
            </g>
          </svg>
        </div>
        {/* <VerticalSlider></VerticalSlider> */}
      </div>
      
    )
  }
}

const mapStateToProps = (state)=>({
  matrixView:state.matrixView
})


export default connect(mapStateToProps)(MatrixView);
