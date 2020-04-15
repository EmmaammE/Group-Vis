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
let WIDTH = 295;
let HEIGHT = 295;
const START_COLOR = 'red'
const END_COLOR = 'rgb(3,93,195)' 
const SINGAL_HEIGHT = 25
let labels
let height
let margin={left:55,top:35,right:5,bottom:5}
let sortedData = -1;
let matrixData
let matrixViewState

let startLoc=[];
let brushFlag=false;
let brushWidth;
let brushHeight;
let singleDis ;

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
      },
      brushVisibility:"hidden",
      brushTransX:0,
      brushTransY:0,
      brushWidth:0,
      brushHeight:0,
    }
    this.$container = React.createRef();
    this.handleMouseenter = this.handleMouseenter.bind(this)
    this.handleMouseout = this.handleMouseout.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleClickX = this.handleClickX.bind(this)
  }

  componentDidMount(){
    const that = this
    let container = this.$container.current
    let svg =  d3.select(container)
    svg.on("mousedown",function(){
      // if(d3.event.target.localName!="circle"){
        // console.log("svg-mousedown",d3.event.offsetX,d3.event.offsetY,d3.event)
      startLoc = [d3.event.offsetX,d3.event.offsetY]
      brushFlag=true
      that.setState({
        brushTransX:startLoc[0],
        brushTransY:startLoc[1],
        brushVisibility:"visible"
      })
      // }
    })
    svg.on("mousemove",function(){
      if(brushFlag){
        let nowX = d3.event.offsetX
        let nowY = d3.event.offsetY
        brushWidth = nowX-startLoc[0]
        brushHeight = nowY-startLoc[1]
        if(brushWidth<0){
          nowX = startLoc[0]+brushWidth
          brushWidth=Math.abs(brushWidth)
        }else{
          nowX = startLoc[0]
        }
        if(brushHeight<0){
          nowY = startLoc[1]+ brushHeight
          brushHeight = Math.abs(brushHeight)
        }else{
          nowY = startLoc[1]
        }
        that.setState({
          brushTransX:nowX,
          brushTransY:nowY,
          brushWidth:brushWidth,
          brushHeight:brushHeight
        })
      }
    })
    svg.on("mouseup",function(){
      if(brushFlag){
        startLoc[0] = that.state.brushTransX
        startLoc[1] = that.state.brushTransY
        brushFlag=false
        // 计算筛选的数据
        let singleDis = labels.length?height/labels.length:height
        // console.log("singleDis",singleDis)
        if(that.state.brushWidth>singleDis&&that.state.brushHeight>singleDis){
          rectFilter(that,singleDis).then(()=>{
            // 刷选框消失
            that.setState({
              brushVisibility:"hidden",
              brushWidth:0,
              brushHeight:0,
              brushTransX:0,
              brushTransY:0
            })
          })
        }else{
          sortedData = -1
          that.setState({
            brushVisibility:"hidden",
            brushWidth:0,
            brushHeight:0,
            brushTransX:0,
            brushTransY:0
          })
        }
      }
    })

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
    if(sortedData==-1||matrixViewState!=this.props.matrixView){
      matrixViewState = this.props.matrixView
      sortedData = sortMatrixPerson(this.props.matrixView)
    }
    
    // console.log("sortedData--matrixView",sortedData)
    matrixData = sortedData.matrixData
    labels = sortedData.matrixPerson
    // xy是比例尺，因为是方型所以，横竖方向使用一个
    // colorMap是颜色比例尺
    
    height = HEIGHT -margin.top-margin.bottom
    let width = WIDTH-margin.left-margin.right

    const {xy,colorMap}=scaleFactory(height,matrixData,START_COLOR,END_COLOR)
    let tipX = margin.left+xy(this.state.highRowLabel)+this.state.targetWidth
    let tipY = margin.top+xy(this.state.highColLabel)
    tipX = tipX ? tipX:0;
    tipY = tipY ? tipY:0;
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
            
            <svg width={WIDTH+40} height={HEIGHT} viewBox={`0 0 ${WIDTH+40} ${HEIGHT}`} ref={this.$container}>
              {labels.length==0
                ?<text 
                  transform={`translate(${margin.left},${margin.top})`}
                  fontSize = "0.8em">{"No Concerned People"}</text>
                :<g transform="translate(0,0)">
                {/* 绘制坐标轴 */}
                {
                  labels.length>25 
                  ?null
                  :<g className="matrix_lables" transform={`translate(${margin.left},${margin.top})`} >
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
                }
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
              </g>
              }
              {/* 绘制动态刷选框 */}
              <g className="matrix-dynamic-brush">
                <rect
                  transform = {`translate(${this.state.brushTransX},${this.state.brushTransY})`}
                  visibility={this.state.brushVisibility}
                  className="brush"
                  width={this.state.brushWidth}
                  height={this.state.brushHeight}
                  opacity="0.2"
                  strokeWidth="3"
                  stroke="red"
                >
                </rect>
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
      }else{
        let tipStyle = {
            left:v.clientX,
            top:v.clientY,
            visibility:"visible"
        }
        that.setState({
          tipData:["none"],
          tipTitle:`count:0`,
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

function rectFilter(that,singleDis){
  return new Promise((resolve)=>{
    let startX = figureXY(that.state.brushTransX,singleDis,margin.left)
    let endX = figureXY(that.state.brushTransX+that.state.brushWidth,singleDis,margin.left)-1
    let startY = figureXY(that.state.brushTransY,singleDis,margin.top)
    let endY= figureXY(that.state.brushTransY+that.state.brushHeight,singleDis,margin.top)-1
    // 取并集
    let startIndex = startX<startY?startX:startY
    let endIndex = endX>endY?endX:endY
    // console.log("startIndex",startIndex,endIndex)
    if(startIndex== endIndex){
      sortedData = -1
      resolve()
    }else{
      sortedData.matrixPerson = labels.slice(startIndex,endIndex-startIndex+1)
      sortedData.matrixData = matrixData.slice(startIndex,endIndex-startIndex+1)
      sortedData.matrixData = sortedData.matrixData.map(v=>v.slice(startIndex,endIndex-startIndex+1))
      // console.log("sortedData",sortedData)
      resolve()
    }
  })
}

function figureXY(brushDis,singleDis,margin){
  // console.log("figureXY",brushDis,singleDis,margin)
  let result 
  if(brushDis<=margin){
    result = 0
  }else{
    let tempDis = brushDis-margin
    result  = Number((tempDis/singleDis).toFixed(0))
    // 如果过半
    if(tempDis-result*singleDis>=singleDis*0.5){
      result+=1
    }
  }
  result = result<0?0:result
  // console.log("result",result)
  return result
  
}