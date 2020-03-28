import React from 'react';
import Lable from '../lable/Lable'
import SeqCircles from '../seqCircles/SeqCircles'
import {scaleFactory,sortTimeLineData,circleData,lineData} from './util';
import './timeLine.css'
import { connect } from 'react-redux';
import * as d3 from 'd3';



const WIDTH = 650;
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
      tooltip:"tooltip",
      tipVisibility:"hidden",
      changeX:"50",
      changeY:"50",
      highRowLabel:-1,
      brushVisibility:"hidden",
      brushTransX:0,
      brushTransY:0,
      brushWidth:0,
      brushHeight:0
    }
    this.$container = React.createRef();
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
  handleMouseenter(v){
    if(v.target.localName=="circle"){
      let targetWidth = Number(v.target.getAttribute("width"));
      let infos = v.target.getAttribute("info").split("_");
      let xChange = v.clientX- svgX;
      let yChange = v.clientY- svgY-targetWidth*3;
      
      this.setState({
        tooltip:infos[2],
        tipVisibility:"visible",
        changeX: xChange,
        changeY: yChange,
        highRowLabel:Number(infos[0])
      })
    }
  }
  handleMouseout(v){
    this.setState({
      tooltip:"",
      tipVisibility:"hidden",
      highRowLabel:-1
    })
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
          <svg width={WIDTH} height={gHeight+margin.top+margin.bottom} 
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
                {/* 绘制tooltip */}
                <g 
                  transform = {`translate(${this.state.changeX},${this.state.changeY-margin.top*2})`}
                  visibility={this.state.tipVisibility}
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
                    textAnchor="start"
                    z-index = "10"
                    fontSize="0.65em"
                  >
                    {this.state.tooltip}
                  </text>
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
          <svg width={WIDTH} height={margin.bottom} viewBox={`0 0 ${WIDTH} ${margin.bottom}`}>
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
      </div>
      
    )
  }
}

const mapStateToProps = (state)=>({
  timeLineView:state.timeLineView
})



export default connect(mapStateToProps)(TimeLine);
