import React from 'react';
import Lable from '../lable/Lable'
import * as d3 from 'd3';
import SeqCircles from '../seqCircles/SeqCircles'
import {scaleFactory,filterTimeLine,filterMatrixView,filterSelectList,deepClone,smallize, reduceRelationData,filterRelationData} from './util';
import Arrow from'./Arrow'
import './topicView.css'
import FlowerLabel from '../flowerLabel/FlowerLabel'
import RectSlider from '../rectSlider/RectSlider'
import { connect } from 'react-redux';
import VerticalSlider from '../verticalSlider/VerticalSlider';
import MatrixButton from '../button/MatrixButton'
import btn4 from '../../assets/list.svg';
import btn3 from '../../assets/matrix.svg';
import btn2 from '../../assets/topic.svg';
import btn1 from '../../assets/map.svg';
import CircleBtn from '../button/circlebtn';
import {updateTopicView} from '../../redux/topicView.redux.js'
import {initTopicWeight} from '../../redux/topicWeight.redux.js'
import {updateTimeLine} from '../../redux/timeLine.redux.js'
import {updateMatrix} from '../../redux/matrixView.redux.js'
import {updateSelectList} from '../../redux/selectList.redux.js'

const btn_urls = [btn1,btn2,btn3,btn4]

const btnData = [
      {btnName:"Add"},
      {btnName:"Minus"}
    ]
let addOrMinus = true;
let margin={left:10,top:30,right:50,bottom:10}
const WIDTH = 380;
const LEFTWIDTH = 90;
// const HEIGHT = 540;
const SINGAL_HEIGHT = 50
const START_COLOR = 'rgb(3,93,195)'
const END_COLOR = 'red' 

let brushDatas=[];
let startLoc=[];
let brushWidth;
let brushHeight;
let svgX ,svgY;
let brushFlag=false;
let topicData=-1;
let yScaleReverse,xScaleReverse;
let xScaleT,yScaleT

class TopicView extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      btnClassName:["choose_btn",""],
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

    this.handleSwitch =this.handleSwitch.bind(this)
    this.handleApply =this.handleApply.bind(this)

    this.handleClickSelectList = this.handleClickSelectList.bind(this)
    this.handleClickMatrixView = this.handleClickMatrixView.bind(this)
    this.handleClickTimeLine = this.handleClickTimeLine.bind(this)
    this.handleClickMapView = this.handleClickMapView.bind(this)
  }

  componentDidMount(){
    const that = this
    let container = this.$container.current
    let svg =  d3.select(container)
    svg.on("mousedown",function(){
      console.log("svg-mousedown",d3.event,d3.event.offsetX,d3.event.offsetY)
      startLoc = [d3.event.offsetX-8,d3.event.offsetY]
      brushFlag=true
      that.setState({
        brushTransX:startLoc[0],
        brushTransY:startLoc[1],
        brushVisibility:"visible"
      })
    })
    svg.on("mousemove",function(){
      // console.log("svg-mousemove",d3.event.layerX,d3.event.layerY)
      if(brushFlag){
        let nowX = d3.event.offsetX-8
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
      console.log("svg-mouseup",d3.event.offsetX,d3.event.offsetY)
      if(brushFlag){
        startLoc[0] = that.state.brushTransX
        startLoc[1] = that.state.brushTransY
        brushFlag=false
        let singleBrushData = {
          addOrMinus:addOrMinus,
          brushTransX:that.state.brushTransX,
          brushTransY:that.state.brushTransY,
          brushWidth:brushWidth,
          brushHeight:brushHeight
        }
        rectFilter(topicData,singleBrushData)
        brushDatas.push(singleBrushData)
        that.setState({
          brushVisibility:"hidden",
          brushWidth:0,
          brushHeight:0
        })
      }
    })
    // let currentX = container.getBoundingClientRect().x
    // let currentY = container.getBoundingClientRect().y
    // svgX=currentX
    // svgY=currentY
  }

  // 下面两个函数为hover之后弹出tooltip的事件处理函数
  handleMouseenter(v){
    if(v.target.localName=="circle"){
      let targetWidth = Number(v.target.getAttribute("width"));
      let infos = v.target.getAttribute("info").split("_")
      // console.log("info",infos);
      // let xChange = v.clientX- svgX
      let xChange = xScaleT(Number(infos[0]))+margin.left
      // let yChange = v.clientY- svgY -targetWidth*3;
      let yChange = yScaleT(Number(infos[1]))+margin.top
      let displayInfo = `${Number(infos[1]).toFixed(4)}_${infos[2]}`

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
    // console.log("mouse-down-vvvv-vvv",v,v.offsetX,v.target,v.target.getBBox())
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
    console.log("mouse-up-vvvv-vvv",v,v.target,v.target.getBBox())
    if(brushFlag){
      startLoc[0] = this.state.brushTransX
      startLoc[1] = this.state.brushTransY
      brushFlag=false
      let singleBrushData = {
        addOrMinus:addOrMinus,
        brushTransX:this.state.brushTransX,
        brushTransY:this.state.brushTransY,
        brushWidth:brushWidth,
        brushHeight:brushHeight
      }
      brushDatas.push(singleBrushData)
      this.setState({
        brushVisibility:"hidden",
        brushWidth:0,
        brushHeight:0
      })
    }
  }

  // 此为切换加选还是减选框的按钮事件函数
  handleSwitch(v){
    let classList = v.target.className.split(" ")
    let index = v.target.id.split("")[0]
    // 如果点击的按钮不是当下选中的按钮
    if(classList.indexOf("choose_btn")==-1){
      addOrMinus=!addOrMinus;
      v.target.className="choose_btn"
      let tempClassName=["",""]
      tempClassName[index]="choose_btn"
      this.setState({
        btnClassName:tempClassName
      })
    }
  }

  // apply按钮的事件，将数据刷选的结果应用到topicView
  handleApply(){
    topicData = brushFilter(topicData)
    brushDatas=[];
    this.setState({
      tooltip:"",
      tipVisibility:"hidden",
      highRowLabel:-1
    })
  }

  // 右上角的四个按钮的 注册事件
  //  selectList视图
  handleClickSelectList(){
    let selectListData= filterSelectList(topicData.cData)
    this.props.updateSelectList({selectListData})
  }
  //  Matrix View视图
  handleClickMatrixView(){
    let matrixViewData = filterMatrixView(topicData.cData)
    this.props.updateMatrix(matrixViewData)
  }
  //  timeLine视图
  handleClickTimeLine(){
    let timeLineData = filterTimeLine(topicData.cData)
    this.props.updateTimeLine(timeLineData)
  }

  // mapView视图按钮
  handleClickMapView(){
    console.log("点击了mapView")
  }

  render(){
    if(topicData==-1||topicData.labelData.length==0){
      topicData = deepClone(this.props.topicView)
      // console.log("this.props.topicView",this.props.topicView)
    }
    
    // 截取一部分数据
    // topicData.labelData= topicData.labelData.slice(0,8)
    // topicData.cData = topicData.cData.slice(0,8)
    // topicData.fData = topicData.fData.slice(0,8)
    // topicData.relationData = smallize(topicData.relationData,8)
    
    smallize(topicData.relationData,8)
    topicData.relationData = reduceRelationData(topicData.relationData,8)
    let rLabels = topicData.labelData
    let cData = topicData.cData
    let relationData = topicData.relationData;
    let fData = topicData.fData;
    let HEIGHT = cData.length*SINGAL_HEIGHT+margin.top+margin.bottom
    // let xNum = 40
    // let backR = Number(WIDTH/xNum).toFixed(0)
    // let yNum = Number(HEIGHT/backR).toFixed(0)
    // let backRects = new Array(xNum)
    // for(let i=0;i<xNum;i++){
    //   backRects[i] = new Array(yNum).fill(0)
    // }

    // console.log("backRects",backRects)

    let width = WIDTH-margin.left-margin.right
    let height = HEIGHT -margin.top-margin.bottom
   
    let handleClick = []
    handleClick.push(this.handleClickMapView)
    handleClick.push(this.handleClickTimeLine)
    handleClick.push(this.handleClickMatrixView)
    handleClick.push(this.handleClickSelectList)
    // console.log("smallize(fData)",relationData)
    // let rHeight = fData.length==0 ? 0: (height/fData.length).toFixed(0)
    let rHeight = SINGAL_HEIGHT*0.8
    const {yScale,xScale,colorMap,value,vScale,yScaleR,xScaleR} = scaleFactory(width,height,cData,START_COLOR,END_COLOR)
    xScaleT = xScale
    yScaleT = yScale
    yScaleReverse = yScaleR
    xScaleReverse = xScaleR
    return (
      <div className="chart-wrapper">
        <div className="title">Topic View</div>
        <div  className="topic-buttons">
          <div className="mButtonContainer" onClick={this.handleSwitch}>
            {btnData.map((v,i)=>(
              <MatrixButton key={v.btnName} id={`${i}_btn`}  btnName={v.btnName} cName={this.state.btnClassName[i]}></MatrixButton>))}
          </div>
          <div className="topic-apply" onClick={this.handleApply}>
            <MatrixButton id="topic-apply-button"  btnName="apply" cName="topic-apply-button"></MatrixButton>
          </div>
          <div className="btn-container">
              {btn_urls.map((url,i)=>(<CircleBtn onClick={handleClick[i]} key={url+'-'+i} url={url} />))}
          </div>   
        </div>
        <div  className="topicViewChart-container">
          <svg
            left="0"
            top="0"
            width="12%" 
            height={HEIGHT} 
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
            height={HEIGHT}  
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            // onMouseDown={this.handleBrushMouseDown}
            // onMouseMove={this.handleBrushMouseMove}
            // onMouseUp={this.handleBrushMouseUp}
          >
            {/* 绘制底部的定位背景元素 */}
            {/* <g>
              {
                backRects.map((v,i)=>(
                  <g 
                    className="backRect_group"
                    key={`back_rect_group_${i}`}
                    transform={`translate(${backR*i},0)`}
                  >
                    {
                      v.map((k,j)=>(
                        <rect
                          key={`back_rect_${i}_${j}`}
                          className="topic_back_rect"
                          transform={`translate(0,${backR*j})`}
                          width={backR}
                          height={backR}
                          fill="red"
                        >
                        </rect>
                      ))
                    }
                  </g>
                ))
              }
            </g> */}
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
                    key={`seqCircles_topic_${i}`}
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
              {
                relationData.length==0?null:
                <Arrow
                  yScale={yScale}
                  data={relationData}
                  height={SINGAL_HEIGHT*8}
                >
                </Arrow>
              }
              
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
                  // stroke="red"
                  // strokeWidth="1"
                  fill="#ffffff">
                </rect>
                <text 
                  // transform = "scale(0.9)"
                  fill="red"
                  className="tooltip-rec"
                  y="10"
                  x="25"
                  textAnchor="start"
                  z-index = "10"
                  fontSize="0.65em"
                >
                  {this.state.tooltip}
                </text>
              </g>
            {/* 绘制已经存在的刷选框 */}
            <g className="exsit-brush-rects">
              {
                brushDatas.map((v,i)=>(
                  <rect
                    key={`exsit-brush-${i}`}
                    className="brush"
                    transform = {`translate(${v.brushTransX},${v.brushTransY})`}
                    width={v.brushWidth}
                    height={v.brushHeight}
                    opacity="0.1"
                    strokeWidth="2"
                    stroke={`${v.addOrMinus?"red":"blue"}`}
                  >
                  </rect>
                 ))
              }
            </g>
            {/* 绘制动态刷选框 */}
            <g className="dynamic-brush-rect">
              <rect
                transform = {`translate(${this.state.brushTransX},${this.state.brushTransY})`}
                visibility={this.state.brushVisibility}
                className="brush"
                width={this.state.brushWidth}
                height={this.state.brushHeight}
                opacity="0.2"
                strokeWidth="3"
                stroke={`${addOrMinus?"red":"blue"}`}
              >
              </rect>
            </g>
          </svg>
          <div className = "slider_space" transform={`translate(${0},${margin.top})`}>
              {
                fData.map((v,i)=>(
                    <VerticalSlider
                      key={`rect_${v}_${i}`}
                      value={v.value}
                      topic = {v.topic}
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

const mapStateToProps = (state)=>({
  topicView:state.topicView,
  topicWeight:state.topicWeight
})


const mapDispatchToProps = {
  updateTopicView,
  initTopicWeight,
  updateSelectList,
  updateMatrix,
  updateTimeLine
}

export default connect(mapStateToProps,mapDispatchToProps)(TopicView);

function rectFilter(data,singleBrush){
  let {addOrMinus,brushTransX,brushTransY,brushWidth,brushHeight} = singleBrush
  let cData=data.cData
  let x1,x2,y1,y2
  //将框选转换成相应横纵轴范围
  x1 = xScaleReverse(brushTransX-margin.left)
  x2 = xScaleReverse(brushTransX+brushWidth-margin.left) 
  y1 = yScaleReverse(brushTransY-margin.top)
  y1 = Math.ceil(y1)
  y1=y1>0?y1:0;
  y2 = yScaleReverse(brushTransY+brushHeight-margin.top)
  y2 = Math.ceil(y2)

  if(!addOrMinus){
    // 减数据
    for(let i=y1;i<y2;i++){
      let j=0;
      while(j<cData[i].length){
        const dis = cData[i][j].distance
        if(dis>x1&&dis<x2){
          // 删掉该数据
          cData[i][j].isChoose = false
        }
        j++
      }
    }
  }else{
    // 加数据
    for(let i=y1;i<y2;i++){
      let j=0;
      if(cData[i].length==undefined){
        continue
      }
      while(j<cData[i].length){
        const dis = cData[i][j].distance
        if(dis>x1&&dis<x2){
          // 删掉该数据
          cData[i][j].isChoose = true
        }
        j++
      }
    }
  }
}

function brushFilter(data){
  //被选中的人名
  // console.log("topicData",topicData)

  let {cData,labelData,relationData,fData} = data
  // 数据先减掉不用的、然后再挑出要用的，返回
  //  减的时候
  //    锁定包含哪些横轴，然后去删掉范围内的数据
  //  加的时候
  //    当两个框有重合时需注意，加完这个框内的数据，要把原数据在框内的部分给删掉，这样就不会重复添加
 
  // let x1,x2,y1,y2
  let newCirData=new Array(labelData.length)
  for(let i=0;i<newCirData.length;i++){
    newCirData[i]=[]
  }
  for(let i=0;i<cData.length;i++){
    for(let j=0;j<cData[i].length;j++){
      if(cData[i][j].isChoose){
        cData[i][j].isChoose =false
        newCirData[i].push(cData[i][j])
      }
    }
  }
  // 从大到小去统计应该删掉的topic
  let deleteLable = []
  for(let i=newCirData.length-1;i>=0;i--){
    //该topic下，数据集为0
    if(newCirData[i].length==0){
      //记录要被删掉的label的序号
      deleteLable.push(i)
    }
  }
  // 删除空的label的相应的数据
  for(let i of deleteLable){
    newCirData.splice(i,1)
    fData.splice(i,1)
    labelData.splice(i,1)
    let j=0;
    while(j<relationData.length){
      let temp = relationData[j]
      // 在被删除坐标之前的往前挪一位
      if(temp[0]>i){
        temp[0]-=1
      }
      if(temp[1]>i){
        temp[1]-=1
      }
      if(temp[0]==i||temp[1]==i){
        relationData.splice(j,1)
      }else{
        j++
      }
    }
  }
  
  cData = newCirData
  
  return {cData,labelData,relationData,fData}
}
