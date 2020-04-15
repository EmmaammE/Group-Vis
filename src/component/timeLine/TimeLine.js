import React from 'react';
import Lable from '../lable/Lable'
import SeqCircles from '../seqCircles/SeqCircles'
import MatrixButton from '../button/MatrixButton'
import {scaleFactory,sortTimeLineData,circleData,lineData} from './util';
import './timeLine.css'
import { connect } from 'react-redux';
import * as d3 from 'd3';
import Tip from '../tooltip/Tip'
import {setPerson} from '../../actions/data'


const WIDTH = 355;
const HEIGHT = 200;
const SINGAL_HEIGHT = 25
const START_COLOR = 'rgb(3,93,195)'
const END_COLOR = 'red' 
const margin={left:50,top:10,right:10,bottom:20}
let startLoc=[];
let brushWidth;
let brushHeight;
let svgX ,svgY;
let brushFlag=false;
let timeLineData
let xScaleRT
let yScaleRT



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

    this.handleClear = this.handleClear.bind(this)

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
    if(v.target.localName=="image"){
      let that = this
      let tipHasX = true
      popUp(that,tipHasX,v) 
    }
  }
  handleMouseenter(v){
    if(v.target.localName=="image"){
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
    console.log("getbox",v.nativeEvent.offsetX,v.nativeEvent.offsetY)
    startLoc = [v.nativeEvent.offsetX,v.nativeEvent.offsetY]
    brushFlag=true
    this.setState({
      brushTransX:startLoc[0],
      brushTransY:startLoc[1],
      brushVisibility:"visible"
    })
  }
  handleBrushMouseMove(v){
    if(brushFlag){
      let nowX = v.nativeEvent.offsetX
      let nowY = v.nativeEvent.offsetY
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
    let x1  = this.state.brushTransX - margin.left
    let y1 = this.state.brushTransY - margin.top
    let x2 = x1 + this.state.brushWidth
    let y2 = y1 + this.state.brushHeight
    // 拿到尺寸数据反推回去
    let brushPersonsId = rectFilter(x1,y1,x2,y2,timeLineData)
    let personsIdObject = [...brushPersonsId]
          .reduce((acc, e) => ({...acc, [e]:true}), {})
    this.props.setPerson(personsIdObject)
    brushFlag=false
    this.setState({
      brushVisibility:"hidden",
      brushTransX:0,
      brushTransY:0,
      brushWidth:0,
      brushHeight:0
    })

  }

  handleClear(){
    timeLineData.tCircleData.forEach((d,i)=>{
        d.forEach(v=>{
          v.isChoose = false
        })
    })
    this.setState({
      brushVisibility:"hidden",
      brushTransX:0,
      brushTransY:0,
      brushWidth:0,
      brushHeight:0
    })
    this.props.setPerson({})
  }

  render(){
    // console.log("sort--before",this.props.timeLineView)
    timeLineData = sortTimeLineData(this.props.timeLineView)
    
    let tLabelData = timeLineData.tLabelData.map(v=>v.name)
    let tCircleData = timeLineData.tCircleData
    
    
    let width = WIDTH-margin.left-margin.right
    let height = HEIGHT -margin.top-margin.bottom
    let gHeight = SINGAL_HEIGHT*tLabelData.length
    gHeight = gHeight>height?gHeight:height
    
    let rownum = tLabelData.length
    const { yScale,yScaleR,xScale,xScaleR,colorMap,timeData,tScale} = scaleFactory(width,gHeight,tLabelData,tCircleData,START_COLOR,END_COLOR)
    xScaleRT = xScaleR
    yScaleRT = yScaleR
    let flag = false
    if(rownum==0||!yScale){
      flag = true
    }
    
    // let cData = circleData.map(v=>v.info)
    return (
      <div 
        className="chart-wrapper">
        <div className="title">Timeline View</div>
        <div className="timeline-clear" onClick={this.handleClear}>
          <MatrixButton id="timeline-clear-button"  btnName="clear" cName="timeline-button"></MatrixButton>
        </div>
        <div className="timeLine-container">
          <svg width={WIDTH} height={gHeight} 
            viewBox={`0 0 ${WIDTH} ${gHeight}`}
            ref={this.$container}
            onMouseDown={this.handleBrushMouseDown}
            onMouseMove={this.handleBrushMouseMove}
            onMouseUp={this.handleBrushMouseUp}
          >
            {flag?null
            :<g transform={`translate(0,${margin.top})`}>
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
                          y1={gHeight/rownum/2}
                          y2={gHeight/rownum/2}
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
                  transform = {`translate(${this.state.brushTransX},${this.state.brushTransY-margin.top})`}
                  visibility={this.state.brushVisibility}
                >
                  <rect
                    className="brush"
                    width={this.state.brushWidth}
                    height={this.state.brushHeight}
                    opacity="0.3"
                    strokeWidth="1.5"
                    stroke="black"
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
            :<g transform={`translate(0,0)`}>
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
                  anchor={"middle"}
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
const mapDispatchToProps = {
  setPerson
}

export default connect(mapStateToProps,mapDispatchToProps)(TimeLine);

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

function rectFilter(x1,y1,x2,y2,data){
  let h1 = Number(yScaleRT(y1).toFixed(0))
  h1 = h1<0?0:h1
  let h2 = Math.floor(yScaleRT(y2))
  h2 = h2<0?0:h2
  let brushPersonsId = []
  data.tLabelData.forEach((v,i)=>{
    if(i>=h1&&i<=h2){
      brushPersonsId.push(v.personId)
    }
  })
  let w1 = xScaleRT(x1)
  let w2 = xScaleRT(x2)
  // 将其标记出来
  data.tCircleData.forEach((d,i)=>{
    if(i>=h1&&i<=h2){
      d.forEach(v=>{
        if(v.distance>=w1&&v.distance<=w2){
          v.isChoose = true
        }
      })
    }
  })

  return brushPersonsId

}