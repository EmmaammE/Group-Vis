import React from 'react';
import Lable from '../lable/Lable'
import SeqCircles from '../seqCircles/SeqCircles'
import {scaleFactory,handleData} from './util';
import Arrow from'./Arrow'
import { connect } from 'react-redux';

const WIDTH = 380;
const HEIGHT = 520;
const START_COLOR = 'rgb(3,93,195)'
const END_COLOR = 'red' 
let startLoc=[];
let brushWidth;
let brushHeight;
let svgX ,svgY;
let brushFlag=false;

class TopicView extends React.Component{
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
    let currentX = container.getBoundingClientRect().x
    let currentY = container.getBoundingClientRect().y
    svgX=currentX
    svgY=currentY
  }
  handleMouseenter(v){
    if(v.target.localName=="circle"){
      let targetWidth = Number(v.target.getAttribute("width"));
      let infos = v.target.getAttribute("info").split("_")
      // console.log("info",infos);
      let xChange = v.clientX- svgX
      let yChange = v.clientY- svgY -targetWidth*3;
      let displayInfo = Number(infos[2]).toFixed(5)

      this.setState({
        tooltip:displayInfo,
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
    startLoc = [v.clientX-svgX-8,v.clientY-svgY]
    brushFlag=true
    this.setState({
      brushTransX:startLoc[0],
      brushTransY:startLoc[1],
      brushVisibility:"visible"
    })
  }
  handleBrushMouseMove(v){
    if(brushFlag){
      let nowX = v.clientX-svgX-8
      let nowY = v.clientY-svgY
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
    const data = {
      label2topics:this.props.label2topics,
      topic2sentence_positions:this.props.topic2sentence_positions,
      pmi_node:this.props.pmi_node
    }

    let topicData = handleData(data)
    let margin={left:60,top:70,right:10,bottom:50}
    let width = WIDTH-margin.left-margin.right
    let height = HEIGHT -margin.top-margin.bottom
    let rLabels = topicData.labelData
    let cData = topicData.cData
    let relationData = topicData.relationData
    const {yScale,xScale,colorMap,value,vScale} = scaleFactory(width,height,cData,START_COLOR,END_COLOR)
    return (
      <div className="chart-wrapper">
        <div className="title">Topic View</div>
        <div ref={this.$container} className="topicViewChart-container">
          <svg ref={this.$container} 
            width="95%" 
            height="100%"  
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            onMouseDown={this.handleBrushMouseDown}
            onMouseMove={this.handleBrushMouseMove}
            onMouseUp={this.handleBrushMouseUp}
          >
            <g className="topic_Lables">
              <Lable 
                key={`lable_row`} 
                translate={`(${margin.left},${margin.top*0.8})`}  
                rowOrColumn = {true} 
                data={rLabels} 
                rotate={-90}
                anchor={"start"}
                highLable={this.state.highRowLabel}
                xy={xScale}>
                </Lable>
              <Lable 
                key={`lable_clolumn`} 
                translate={`(${margin.left/2},${margin.top})`}  
                owOrColumn = {false} 
                data={value}
                anchor={"end"}
                rotate={0}
                xy={vScale}>
              </Lable>
            </g>
            <g 
              transform={`translate(${margin.left},${margin.top})`} 
              className="topic_circle_columns"
              onMouseOver={this.handleMouseenter}
              onMouseOut = {this.handleMouseout}
            >
              {
                cData.map((v,i)=>(
                  <SeqCircles
                    key={`${v}_${i}`}
                    data={v}
                    rowOrColumn={false}
                    gxy = {xScale}
                    xy = {yScale}
                    index={i}
                    colorMap={colorMap}
                  >
                  </SeqCircles>
                ))
              }
            </g>
            <g transform={`translate(${margin.left},${HEIGHT-margin.bottom})`}>
              <Arrow
                xScale={xScale}
                data={relationData}
              >
              </Arrow>
            </g>
            {/* 绘制tooltip */}
            <g 
                transform = {`translate(${this.state.changeX},${this.state.changeY})`}
                visibility={this.state.tipVisibility}
              >
                <rect className="tooltip-g"
                  width="50"
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
                  x="25"
                  textAnchor="middle"
                  z-index = "10"
                  fontSize="0.65em"
                >
                  {this.state.tooltip}
                </text>
              </g>
            {/* 绘制刷选框 */}
            <g
                transform = {`translate(${this.state.brushTransX},${this.state.brushTransY})`}
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
          </svg>
        </div>
      </div>
      
    )
  }
}

export default connect(state=>state.topicData)(TopicView);
