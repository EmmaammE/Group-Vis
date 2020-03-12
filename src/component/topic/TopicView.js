import React from 'react';
import Lable from '../lable/Lable'
import SeqCircles from '../seqCircles/SeqCircles'
import {scaleFactory,handleData} from './util';
import Arrow from'./Arrow'
import './topicView.css'
import FlowerLabel from '../flowerLabel/FlowerLabel'
import RectSlider from '../rectSlider/RectSlider'
import { connect } from 'react-redux';
import VerticalSlider from '../verticalSlider/VerticalSlider';


let margin={left:10,top:70,right:40,bottom:30}
const WIDTH = 370;
const LEFTWIDTH = 90;
const HEIGHT = 520;
const START_COLOR = 'rgb(3,93,195)'
const END_COLOR = 'red' 
let startLoc=[];
let brushWidth;
let brushHeight;
let svgX ,svgY;
let brushFlag=false;
let topicData=-1;
let yScaleReverse,xScaleReverse;

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

  // 下面两个函数为hover之后弹出tooltip的事件处理函数
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
    if(brushFlag){
      startLoc[0] = this.state.brushTransX
      startLoc[1] = this.state.brushTransY
      brushFlag=false
      this.setState({
        brushVisibility:"hidden",
        brushWidth:0,
        brushHeight:0
      })
      topicData = brushFilter(topicData)
      console.log("filter,topicData",topicData)
    }
  }




  render(){
    if(topicData==-1){
      let data = {
        label2topics:this.props.label2topics,
        topic2sentence_positions:this.props.topic2sentence_positions,
        pmi_node:this.props.pmi_node
      }
      topicData = handleData(data)
    }
    let width = WIDTH-margin.left-margin.right
    let height = HEIGHT -margin.top-margin.bottom
    let rLabels = topicData.labelData
    let cData = topicData.cData
    let relationData = topicData.relationData;
    let fData = topicData.fData;
    let rHeight = fData.length==0? 0: (height/fData.length).toFixed(0)
    rHeight = rHeight>80?80:(rHeight<30?30:rHeight)
    const {yScale,xScale,colorMap,value,vScale,yScaleR,xScaleR} = scaleFactory(width,height,cData,START_COLOR,END_COLOR)
    yScaleReverse = yScaleR
    xScaleReverse = xScaleR
    return (
      <div className="chart-wrapper">
        <div className="title">Topic View</div>
        <div  className="topicViewChart-container">
          <svg
            left="0"
            top="0"
            width="12%" 
            height="100%" 
          >
            {/* 绘制坐标轴文字 */}
            <g className="topic_Lables" >
              <Lable 
                key={`lable_row`} 
                translate={`(${LEFTWIDTH*0.5},${margin.top-10})`}  
                rowOrColumn = {false} 
                data={rLabels} 
                rotate={45}
                anchor={"end"}
                highLable={this.state.highRowLabel}
                fontSize={"0.8em"}
                colorful={true}
                xy={yScale}>
                </Lable>
            </g>
            {/* 绘制花瓣 */}
            <g
              transform={`translate(${LEFTWIDTH*0.3},${margin.top})`} 
              className="flower_Lables"
            >
              {
                  fData.map((v,i)=>(
                    <g className="flower_slider" 
                      transform={`translate(0,${yScale(i)})`}
                      key={`${v}_${i}`}
                    >
                      <FlowerLabel
                      
                      >
                      </FlowerLabel>  
                    </g>
                  ))
                }
            </g>
            {/* 绘制滑块 */}
            {/* <g
              transform={`translate(${LEFTWIDTH*0.7},${margin.top})`} 
              className="rect_sliders"
            >
              {
                  fData.map((v,i)=>(
                      <RectSlider
                        key={`rect_${v}_${i}`}
                        value={v}
                        index={i}
                        yScale={yScale}
                        height={rHeight}
                      ></RectSlider>
                  ))
                }
            </g> */}
          </svg>
          <svg 
            ref={this.$container} 
            width="88%" 
            height="100%"  
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            onMouseDown={this.handleBrushMouseDown}
            onMouseMove={this.handleBrushMouseMove}
            onMouseUp={this.handleBrushMouseUp}
          >
            {/* 绘制横向圆圈串 */}
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
                    rowOrColumn={true}
                    gxy = {yScale}
                    xy = {xScale}
                    index={i}
                    colorMap={colorMap}
                    opacity="0.5"
                    r="6"
                  >
                  </SeqCircles>
                ))
              }
            </g>
            {/* 绘制箭头 */}
            <g transform={`translate(${WIDTH-margin.right},${margin.top})`}>
              <Arrow
                yScale={yScale}
                data={relationData}
                height={HEIGHT-margin.top-margin.bottom}
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
          <div className = "slider_space">
              {
                fData.map((v,i)=>(
                    <VerticalSlider
                      key={`rect_${v}_${i}`}
                      value={v}
                      index={i}
                      top={margin.top+yScale(i)-rHeight*0.5}
                      yScale={yScale}
                      height={rHeight}
                    ></VerticalSlider>
                ))
              }
          </div>
        </div>
      </div>
      
    )
  }
}

export default connect(state=>state.topicData)(TopicView);

function brushFilter(data){
  //被选中的人名
  let cPersons = []
  // console.log("topicData",topicData)

  let {cData,labelData,relationData,fData} = data

  let x1 = xScaleReverse(startLoc[0]-margin.left)
  
  let x2 = xScaleReverse(startLoc[0]+brushWidth-margin.left)
  
  let y1 = yScaleReverse(startLoc[1]-margin.top)
  y1 = Math.ceil(y1)
  y1=y1>0?y1:0;
  let y2 = yScaleReverse(startLoc[1]+brushHeight-margin.top)
  y2 = Math.ceil(y2)
  // console.log("x12,y12",x1,x2,y1,y2)
  labelData =  labelData.slice(y1,y2)
  cData = cData.slice(y1,y2)
  fData = fData.slice(y1,y2)
  let nRelationData=[]
  relationData.map(v=>{
    if(v[1]>=y1&&v[0]<y2){
      v[0]-=y1
      v[1]-=y1
      nRelationData.push(v)
    }
  })
  relationData = nRelationData


  cData.map(topic=>{
    let i =0;
    while(i<topic.length){
      //  去除超出范围的点
      // console.log("distance...x1...x2",topic[i].distance,x1,x2)
      if(topic[i].distance<x1||topic[i].distance>x2){
        topic.splice(i,1)
      }else{
        i++;
      }
    }
  })
  return {cData,labelData,relationData,fData}
}
