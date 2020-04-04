import React from 'react';

import './matrixView.css';
import * as d3 from 'd3';
import MatrixColumn from '../matrixColumn/MatrixColumn'
import LeftLable from '../leftLable/LeftLable'
import {scaleFactory,sortMatrixPerson} from '../util/util'
import { connect } from 'react-redux';
import {updateSelectList} from '../../../redux/selectList.redux'
import Tip from '../../tooltip/Tip'


// import 
// 暂时的假数据
let WIDTH = 270;
let HEIGHT = 270;
const START_COLOR = 'red'
const END_COLOR = 'rgb(3,93,195)' 
const SINGAL_HEIGHT = 25
let labels

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
      highColLabel:-1,
      tipHasX:true,
      tipTitle:"count:",
      tipData:[],
      tipStyle:{
        visibility:"hidden"
      }
    }
    this.$container = React.createRef();
    this.handleMouseenter = this.handleMouseenter.bind(this)
    this.handleMouseout = this.handleMouseout.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleClickX = this.handleClickX.bind(this)
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
      let that = this
      let tipHasX = false
      popUp(that,tipHasX,v)
    }
  }

  handleMouseout(v){
    if(!this.state.tipHasX){
      let that = this
      popDown(that)
    }
  }

  handleClick(v){
    if(v.target.localName=="rect"){
      let that = this
      let tipHasX = true
      popUp(that,tipHasX,v)
    }
  }

  handleClickX(){
    let that = this
    popDown(that)
  }
  render(){
  
    let sortedData;
    sortedData = sortMatrixPerson(this.props.matrixView)
    // console.log("sortedData--matrixView",sortedData)
    let matrixData = sortedData.matrixData
    labels = sortedData.matrixPerson
    // xy是比例尺，因为是方型所以，横竖方向使用一个
    // colorMap是颜色比例尺
    let margin={left:40,top:40,right:10,bottom:10}
    
    HEIGHT = labels.length*SINGAL_HEIGHT+margin.top+margin.bottom
    if(HEIGHT>WIDTH){
      WIDTH = HEIGHT>WIDTH? HEIGHT : WIDTH
    }
    HEIGHT = WIDTH
    let height = HEIGHT -margin.top-margin.bottom
    let width = WIDTH-margin.left-margin.right

    const {xy,colorMap}=scaleFactory(height,matrixData,START_COLOR,END_COLOR)
    let tipX = margin.left+xy(this.state.highRowLabel)+this.state.targetWidth
    let tipY = margin.top+xy(this.state.highColLabel)
    tipX = tipX ? tipX:0;
    tipY = tipY ? tipY:0;
    // let labels = ['SuShi', 'WangAnshi', 'SuZhe', 'OuYangxiu', 'ZhengXie', 'SuShi', 'WangAnshi', 'SuZhe', 'OuYangxiu', 'ZhengXie','SuShi', 'WangAnshi', 'SuZhe', 'OuYangxiu', 'ZhengXie'];
    return (
      <div className="chart-wrapper">
        <div className="header-line">
          <div className="title">People Matrix View</div>
        </div>
        {
          <Tip
            tipHasX = {this.state.tipHasX}
            data = {this.state.tipData}
            title = {this.state.tipTitle}
            style={this.state.tipStyle}
            handleClickX ={this.handleClickX}
          >
          </Tip>
        }
        <div  className="matrix-container">
          {
            labels.length==0?"No Concerned People":
            <svg width={WIDTH+40} height={HEIGHT} viewBox={`0 0 ${WIDTH+40} ${HEIGHT}`} ref={this.$container}>
              <g transform="translate(0,0)">
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
                  onClick = {this.handleClick}
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
                    // stroke="red"
                    // strokeWidth="1"
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
                    {`count:${this.state.tooltip}`}
                  </text>
                </g>
              </g>
            </svg>
          }
          
        </div>
        {/* <VerticalSlider></VerticalSlider> */}
      </div>
      
    )
  }
}

const mapStateToProps = (state)=>({
  matrixView:state.matrixView,
  peopleToList:state.peopleToList
})
const mapDispatchToProps={
  updateSelectList
}


export default connect(mapStateToProps,mapDispatchToProps)(MatrixView);


function popUp(that,tipHasX,v){
  let infos = v.target.getAttribute("info").split("_").map(v=>Number(v))
      let name = []
      name.push(labels[infos[0]])
      name.push(labels[infos[1]])
      let joinName = name.sort((a,b)=>{
          return b.localeCompare(a)
      }).join('-')
      if(that.props.peopleToList[joinName]!=undefined){
        let selectListData = that.props.peopleToList[joinName]
        let tipStyle = {
            left:v.clientX,
            top:v.clientY,
            visibility:"visible"
        }
        that.setState({
          tipData:selectListData,
          tipTitle:`count:${selectListData.length}`,
          tipStyle:tipStyle,
          tipHasX:tipHasX
        })
      }
}

function popDown(that){
  let tipStyle = {
    visibility:"hidden"
  }
  that.setState({
    tipStyle:tipStyle
  })
}