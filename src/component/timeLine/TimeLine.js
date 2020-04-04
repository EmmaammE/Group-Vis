import React from 'react';
import Lable from '../lable/Lable'
import SeqCircles from '../seqCircles/SeqCircles'
import {scaleFactory,sortTimeLineData,circleData,lineData} from './util';
import './timeLine.css'
import { connect } from 'react-redux';
import * as d3 from 'd3';
import Tip from '../tooltip/Tip'


const WIDTH = 380;
const HEIGHT = 200;
const SINGAL_HEIGHT = 30
const START_COLOR = 'rgb(3,93,195)'
const END_COLOR = 'red' 
let startLoc=[];
let brushWidth;
let brushHeight;
let svgX ,svgY;
let brushFlag=false;

class TimeLine extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      highRowLabel:-1,
      brushVisibility:"hidden",
      brushTransX:0,
      brushTransY:0,
      brushWidth:0,
      brushHeight:0,
      tipHasX:false,
      tipTitle:"topicName",
      tipData:[],
      tipStyle:{
        visibility:"hidden"
      }
    }
    this.$container = React.createRef();
    this.handleClickCircle = this.handleClickCircle.bind(this)
    this.handleClickX =  this.handleClickX.bind(this)
    this.handleMouseenter = this.handleMouseenter.bind(this)
    this.handleMouseout = this.handleMouseout.bind(this)
    this.handleBrushMouseDown = this.handleBrushMouseDown.bind(this)
    this.handleBrushMouseMove = this.handleBrushMouseMove.bind(this)
    this.handleBrushMouseUp = this.handleBrushMouseUp.bind(this)

  }

  componentDidMount(){
    let container = this.$container.current
    // console.log("boundingClient",container.getBoundingClientRect())
    let currentX = container.getBoundingClientRect().x
    let currentY = container.getBoundingClientRect().y
    svgX=currentX
    svgY=currentY
  }

  handleClickCircle(v){
    if(v.target.localName=="circle"){
      let that = this
      let tipHasX = true
      popUp(that,tipHasX,v) 
    }
  }
  handleMouseenter(v){
    if(v.target.localName=="circle"){
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

  handleClickX(){
    let that = this
    popDown(that)
  }



  // 下面三个函数为刷选框的监听函数
  handleBrushMouseDown(v){
    // console.log("getbox",v.clientX,v.screenX,v.screenY)
    startLoc = [v.clientX-svgX-2,v.clientY-svgY-3]
    brushFlag=true
    this.setState({
      brushTransX:startLoc[0],
      brushTransY:startLoc[1],
      brushVisibility:"visible"
    })
  }
  handleBrushMouseMove(v){
    if(brushFlag){
      let nowX = v.clientX-svgX-2
      let nowY = v.clientY-svgY-3
      brushWidth = nowX-startLoc[0]
      brushHeight = nowY-startLoc[1]
      if(brushWidth<0){
        nowX = startLoc[0]+brushWidth
        brushWidth=Math.abs(brushWidth)
      }else{
        nowX = startLoc[0]
      }
      if(brushHeight<0){
        nowY = startLoc[1]+brushHeight
        brushHeight = Math.abs(brushHeight)
      }else{
        nowY = startLoc[1]
      }
      this.setState({
        brushTransX:nowX,
        brushTransY:nowY,
        brushWidth:brushWidth,
        brushHeight:brushHeight
      })
    }
  }
  handleBrushMouseUp(v){
    startLoc[0] = this.state.brushTransX
    startLoc[1] = this.state.brushTransY
    brushFlag=false
    this.setState({
      brushVisibility:"hidden",
      brushWidth:0,
      brushHeight:0
    })

  }

  render(){
    // console.log("sort--before",this.props.timeLineView)
    let timeLineData = sortTimeLineData(this.props.timeLineView)
    
    let tLabelData = timeLineData.tLabelData.map(v=>v.name)
    let tCircleData = timeLineData.tCircleData
    
    let margin={left:70,top:10,right:40,bottom:20}
    let width = WIDTH-margin.left-margin.right
    let height = HEIGHT -margin.top-margin.bottom
    let gHeight = SINGAL_HEIGHT*tLabelData.length
    gHeight = gHeight>height?gHeight:height
    
    let rownum = tLabelData.length
    const {yScale,xScale,colorMap,timeData,tScale} = scaleFactory(width,gHeight,tLabelData,tCircleData,START_COLOR,END_COLOR)
    let flag = false
    if(rownum==0||!yScale){
      flag = true
    }
    
    // let cData = circleData.map(v=>v.info)
    return (
      <div className="chart-wrapper">
        <div className="title">Timeline View</div>
        <div className="timeLine-container">
          <svg width={WIDTH} height={gHeight} 
            viewBox={`0 0 ${WIDTH} ${gHeight}`}
            ref={this.$container}
            onMouseDown={this.handleBrushMouseDown}
            onMouseMove={this.handleBrushMouseMove}
            onMouseUp={this.handleBrushMouseUp}
          >
            {flag?null
            :<g transform={`translate(20,${margin.top})`}>
                {/* 绘制左边标签 */}
                <g className="timeLine_Lables" >
                  <Lable  
                    translate={`(0,0)`}  
                    rowOrColumn = {false} 
                    data={tLabelData}
                    rotate={0}
                    anchor={"start"}
                    highLable={this.state.highRowLabel}
                    xy={yScale}>
                  </Lable>
                </g>
                {/* 绘制圆点及水平向分割线 */}
                <g transform={`translate(${margin.left},0)`} className="timeLine_circle_rows">
                  {
                    tCircleData.map((v,i)=>(
                      <g 
                        key={`Circle_time_${i}`}
                        onMouseEnter={this.handleMouseenter}
                        onMouseOut = {this.handleMouseout}
                        onClick = {this.handleClickCircle}
                        >
                        <SeqCircles
                          key={`SeqCircles_time_${i}`}
                          data={v}
                          rowOrColumn={true}
                          gxy = {yScale}
                          xy = {xScale}
                          index={i}
                          opacity="0.5"
                          colorMap={colorMap}
                        >
                        </SeqCircles>
                        <line
                          key={`line_${i}`}
                          transform={`translate(${-margin.left},${yScale(i)})`}
                          x1={0}
                          x2={WIDTH-margin.right}
                          y1={height/rownum/2}
                          y2={height/rownum/2}
                          strokeWidth="0.3px"
                          stroke="black"
                        >
                        </line>
                      </g> 
                    ))
                  }
                </g>
                {/* 绘制竖向虚线 */}
                <g className="markLines" transform={`translate(${margin.left},0)`}>
                  {
                    lineData.map((v)=>(
                      <line 
                        key={`markLines${v}`}
                        className="time_mark_line"
                        x1={xScale(v)}
                        x2={xScale(v)}
                        y1={0}
                        y2={height-5}
                        stroke={END_COLOR}
                        strokeDasharray={"1.5 1.5"}
                      >
                      </line>
                    ))
                  }
                </g>
                {/* 绘制刷选框 */}
                <g
                  transform = {`translate(${this.state.brushTransX-20},${this.state.brushTransY-margin.top})`}
                  visibility={this.state.brushVisibility}
                >
                  <rect
                    className="brush"
                    width={this.state.brushWidth}
                    height={this.state.brushHeight}
                    opacity="0.3"
                    strokeWidth="1.5"
                    stroke="red"
                  >
                  </rect>
                </g>
            </g>
             }
          </svg>
        </div>
        <div className="timeLine_underLabel">
          <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${margin.bottom}`}>
            {rownum==0?null
            :<g transform={`translate(20,0)`}>
              {/* 绘制底下时间轴坐标 */}
              <g transform={`translate(0,0)`}>
                <rect
                  width={WIDTH}
                  height={20}
                  fill={"#cccccc"}
                >  
                </rect>
              </g>
              {/* 绘制底下时间轴数字 */}
              <g className="timeLine_rLables" >
                <Lable  
                  translate={`(${margin.left},10)`}  
                  rowOrColumn = {true} 
                  data={timeData}
                  anchor={"end"}
                  rotate={0}
                  xy={tScale}>
                </Lable>
              </g>
            </g>
            }
          </svg>
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
      </div>
      
    )
  }
}

const mapStateToProps = (state)=>({
  timeLineView:state.timeLineView
})

export default connect(mapStateToProps)(TimeLine);

function popUp(that,tipHasX,v){
  let infos = v.target.getAttribute("info").split("_");
  let tipTitle = `时间：${infos[1]}`
  let targetData = infos[2]
  let tipStyle = {
    left:v.clientX,
    top:v.clientY,
    visibility:"visible"
  }
  that.setState({
    tipHasX:tipHasX,
    tipData:[targetData],
    tipTitle:tipTitle,
    tipStyle:tipStyle
  })
}

function popDown(that){
  let tipStyle = {
    visibility:"hidden"
  }
  that.setState({
    tipStyle:tipStyle
  })
}