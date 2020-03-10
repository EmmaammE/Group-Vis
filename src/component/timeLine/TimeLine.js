import React from 'react';
import Lable from '../lable/Lable'
import SeqCircles from '../seqCircles/SeqCircles'
import {scaleFactory,circleData,lineData} from './util';
import './timeLine.css'

const WIDTH = 650;
const HEIGHT = 220;
const START_COLOR = 'rgb(3,93,195)'
const END_COLOR = 'red' 

class TimeLine extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      tooltip:"tooltip",
      visibility:"hidden",
      x:"0",
      y:"0",
      changeX:"50",
      changeY:"50",
      highRowLabel:3
    }
    this.$container = React.createRef();
    this.handleMouseenter = this.handleMouseenter.bind(this)
    this.handleMouseout = this.handleMouseout.bind(this)
  }

  componentDidMount(){
    let container = this.$container.current
    let currentX = container.getBoundingClientRect().x
    let currentY = container.getBoundingClientRect().y
    this.setState({
      x:currentX,
      y:currentY
    })
    // console.log("container",currentX,currentY)
  }

  handleMouseenter(v){
    if(v.target.localName=="circle"){
      // console.log("getbox",v.clientX,v.target.getBBox())
      let targetWidth = Number(v.target.getAttribute("width"));
      let infos = v.target.getAttribute("info").split("_")
      // console.log("infos",infos)
      let xChange = v.clientX- this.state.x
      let yChange = v.clientY- this.state.y-targetWidth*3;
      
      this.setState({
        tooltip:infos[2],
        visibility:"visible",
        changeX: xChange,
        changeY: yChange,
        highRowLabel:Number(infos[0])
      })
    }
  }

  handleMouseout(v){
    this.setState({
      tooltip:"",
      visibility:"hidden",
      highRowLabel:-1
    })
  }


  render(){
    let margin={left:70,top:10,right:30,bottom:20}
    let width = WIDTH-margin.left-margin.right
    let height = HEIGHT -margin.top-margin.bottom
    const {yScale,xScale,colorMap,timeData,tScale} = scaleFactory(width,height,circleData,START_COLOR,END_COLOR)
    let rLabels = circleData.map(v=>v.name)
    let rownum = rLabels.length
    let cData = circleData.map(v=>v.info)
    return (
      <div className="chart-wrapper">
        <div className="title">Timeline View</div>
        <div ref={this.$container} className="timeLine-container">
          <svg width="100%" height="100%" 
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            ref={this.$container}
            >
            <g transform={`translate(20,${margin.top})`}>
              {/* 绘制左边标签 */}
              <g className="timeLine_Lables" >
                <Lable  
                  translate={`(0,0)`}  
                  rowOrColumn = {false} 
                  data={rLabels}
                  rotate={0}
                  anchor={"start"}
                  highLable={this.state.highRowLabel}
                  xy={yScale}>
                </Lable>
              </g>
              {/* 绘制圆点及水平向分割线 */}
              <g transform={`translate(${margin.left},0)`} className="timeLine_circle_rows">
                {
                  cData.map((v,i)=>(
                    <g 
                      key={`${v}_time_${i}`}
                      onMouseEnter={this.handleMouseenter}
                      onMouseOut = {this.handleMouseout}
                      >
                      <SeqCircles
                        key={`${v}_time_${i}`}
                        data={v}
                        rowOrColumn={true}
                        gxy = {yScale}
                        xy = {xScale}
                        index={i}
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
              {/* 绘制底下时间轴坐标 */}
              <g transform={`translate(0,${height-height/rownum/2})`}>
                <rect
                  width={WIDTH-margin.right}
                  height={20}
                  fill={"#cccccc"}
                >  
                </rect>
              </g>
              {/* 绘制底下时间轴数字 */}
              <g className="timeLine_rLables" >
                <Lable  
                  translate={`(${margin.left},${height-height/rownum/2+10})`}  
                  rowOrColumn = {true} 
                  data={timeData}
                  anchor={"end"}
                  rotate={0}
                  xy={tScale}>
                </Lable>
              </g>
              {/* 绘制tooltip */}
              <g 
                transform = {`translate(${this.state.changeX},${this.state.changeY-margin.top*2})`}
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
                  textAnchor="middle"
                  z-index = "10"
                  fontSize="0.65em"
                >
                  {this.state.tooltip}
                </text>
              </g>
            </g>
          </svg>
        </div>
      </div>
      
    )
  }
}

export default TimeLine;
