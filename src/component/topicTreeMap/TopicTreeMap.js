import React from 'react';
import Lable from '../lable/Lable'
import * as d3 from 'd3';
import SeqCircles from '../seqCircles/SeqCircles'
import {scaleFactory,
      filterTimeLine,
      filterMatrixView,
      filterSelectList,
      // deepClone,
      smallize, 
      reduceRelationData,
      rectTree,
      filterRelationData} from './util';
import {deepClone} from '../../util/tools'
import Arrow from'./Arrow'
import './topicTreeMap.css'
import FlowerLabel from '../flowerLabel/FlowerLabel'
import RectSlider from '../rectSlider/RectSlider'
import { connect } from 'react-redux';
import VerticalSlider from '../verticalSlider/VerticalSlider';
import SvgSlider from '../verticalSlider/SvgSlider';
import MatrixButton from '../button/MatrixButton'
import CircleBtn from '../button/circlebtn';
import {updateTopicView} from '../../redux/topicView.redux.js'
import {initTopicWeight} from '../../redux/topicWeight.redux.js'
import {updateTimeLine} from '../../redux/timeLine.redux.js'
import {updateMatrix} from '../../redux/matrixView.redux.js'
import {updateSelectList} from '../../redux/selectList.redux.js'
import {updateTopicWeight,updateTopicLrs} from '../../redux/topicWeight.redux.js'
import RectLeaf from './rectLeaf/RectLeaf'
import { setPerson } from '../../actions/data'
import {updateGroupdata} from '../../actions/step.js'

const btnData = [
      {btnName:"Add"},
      {btnName:"Minus"}
    ]
let addOrMinus = true;

let margin={left:15,top:15,right:15,bottom:15}
const WIDTH = 630;
const HEIGHT = 480

let brushPersons = {}
let mapViewPersons = {}

// const LEFTWIDTH = 90;
// const HEIGHT = 540;
// const SINGAL_HEIGHT = 50
// const START_COLOR = 'rgb(3,93,195)'
// const END_COLOR = 'red' 

let brushDatas=[];
let startLoc=[];
let brushWidth;
let brushHeight;
// let svgX ,svgY;
let brushFlag=false;
let topicData=[];
// let yScaleReverse,xScaleReverse;
// let xScaleT,yScaleT

// let sliderWeights=[]
let sliderHeight = 45
let sliderWidth = 5
let sliderIndex = -1
let startY 
let startWeight
let dragFlag = false
let sliderTimer = null
let sliderMoveTimer  = null
let updateFlag = false
let sliderWeights=[]

class TopicTreeMap extends React.Component{
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
      brushHeight:0,
      sliderWeights:[]
    }
    this.$container = React.createRef();
    this.handleMouseenter = this.handleMouseenter.bind(this)
    this.handleMouseout = this.handleMouseout.bind(this)

    this.handleSliderInput = this.handleSliderInput.bind(this)
    
    this.handleSwitch =this.handleSwitch.bind(this)
    this.handleApply =this.handleApply.bind(this)

    this.handleClickSelectList = this.handleClickSelectList.bind(this)
    this.handleClickMatrixView = this.handleClickMatrixView.bind(this)
    this.handleClickTimeLine = this.handleClickTimeLine.bind(this)
    this.handleClickMapView = this.handleClickMapView.bind(this)

    this.handleSliderMouseDown = this.handleSliderMouseDown.bind(this)
    this.handleSliderMouseMove = this.handleSliderMouseMove.bind(this)
    this.handleSliderMouseUp = this.handleSliderMouseUp.bind(this)
    this.handleSliderMouseOut = this.handleSliderMouseOut.bind(this)
  
  }


  componentDidMount(){
    this.setState({sliderWeights:topicData.map(v=>v.weight)})
    const that = this
    let container = this.$container.current
    let svg =  d3.select(container)
    svg.on("mousedown",function(){
      if(!dragFlag&&d3.event.target.localName!="circle"){
        // console.log("svg-mousedown",d3.event.offsetX,d3.event.offsetY,d3.event)
        startLoc = [d3.event.offsetX-8,d3.event.offsetY]
        brushFlag=true
        that.setState({
          brushTransX:startLoc[0],
          brushTransY:startLoc[1],
          brushVisibility:"visible"
        })
      }
    })
    svg.on("mousemove",function(){
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
          brushHeight:0,
          brushTransX:0,
          brushTransY:0
        })
        //  高亮xxx-view......
        let brushPersonsId = Object.keys(brushPersons)
        let personsIdObject = [...brushPersonsId]
          .reduce((acc, e) => ({...acc, [e]:true}), {})
        console.log("brushPersonsId",brushPersonsId);
        that.props.setPerson(personsIdObject)
      }
    })
  }
  componentDidUpdate(){
    // 当sliderWeights为0时才需要更新
    if(topicData.length>0&&!updateFlag){
      updateFlag = true
      this.setState({sliderWeights:topicData.map(v=>v.weight)})
    }
  }

  // 下面两个函数为hover之后弹出tooltip的事件处理函数
  handleMouseenter(v){
    if(v.target.localName=="image"){
      let infos = v.target.getAttribute("info").split("_")
      let targetData = topicData[Number(infos[0])].cData[Number(infos[1])]
      let xChange = targetData.tx
      let yChange = targetData.ty-15
      let displayInfo = `${infos[2]}`
      
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

  // 此为滑块调节的响应函数
  handleSliderInput(e){
      console.log("target:-------",e.target)
      let temp = e.target.value
      let index = e.target.index
      const topic = e.target.getAttribute("topic")
      // console.log("eeee",e,e.target,topic,temp)
      // 填充滑块有值部分，backgound-size转化为驼峰命名的方法
      e.target.style.backgroundSize = `${temp*100}% 100%`
      const data = {
        index:index,
        weight:temp
      }
      // this.props.updateTopicWeight(data)
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
    let that = this
    topicData = brushFilter(topicData,that)
    

    brushDatas=[]
    mapViewPersons = {...brushPersons}
    brushPersons = {}
    this.setState({
      tooltip:"",
      tipVisibility:"hidden",
      highRowLabel:-1
    })

    // 取消XXX-view所有高亮的人
    this.props.setPerson({});

  }

  // 右上角的四个按钮的 注册事件
  //  selectList视图
  handleClickSelectList(){
    let selectListData= filterSelectList(topicData)
    this.props.updateSelectList({selectListData})
  }
  //  Matrix View视图
  handleClickMatrixView(){
    let matrixViewData = filterMatrixView(topicData)
    this.props.updateMatrix(matrixViewData)
  }
  //  timeLine视图
  handleClickTimeLine(){
    let timeLineData = filterTimeLine(topicData)
    this.props.updateTimeLine(timeLineData)
  }

  // mapView视图按钮
  handleClickMapView(){
    console.log("点击了mapView")
    let step = this.props.currentStep
    console.log("step,brusPersons",step,mapViewPersons)
    this.props.updateGroupdata("people",step,mapViewPersons)

  }

  handleSliderMouseDown(e){
    console.log("slider-mouse-down")
    startY = e.clientY
    sliderIndex =  Number(e.target.getAttribute("index"))
    // sliderWeights
    startWeight = this.props.topicWeight[sliderIndex]
    dragFlag = true
    sliderTimer = null
    
  }
  handleSliderMouseMove(e){
    if(dragFlag){
      let dis = Number((((e.clientY - startY)/sliderHeight)*60).toFixed(0))
      let temp = dis + startWeight
      temp = temp>100?100:temp
      temp = temp<0?0:temp
      this.props.updateTopicWeight({
        index:sliderIndex,
        weight:temp
      })
    }
  }
  handleSliderMouseUp(e){
    let that = this
    adjustTreeMapUI(that)
  }
  handleSliderMouseOut(){
    if(dragFlag==true){
      let that = this
      adjustTreeMapUI(that)
    }
    
  }

  

  render(){
    if(topicData.length==0){
      topicData = deepClone(this.props.topicView)
    }
    let rectTreeData = []
    
    if(topicData.length>0){
      rectTreeData = rectTree(WIDTH,HEIGHT,topicData)
      sliderWeights = this.props.topicWeight     
    }
    
    // console.log("topicData",topicData,rectTreeData,sliderWeights)
    
    let width = WIDTH-margin.left-margin.right
    let height = HEIGHT -margin.top-margin.bottom
   
    let handleClick = []
    handleClick.push(this.handleClickTimeLine)
    handleClick.push(this.handleClickMatrixView)
    handleClick.push(this.handleClickMapView)
    handleClick.push(this.handleClickSelectList)
    return (
      <div className="chart-wrapper">
        <div className="title">Topic View</div>
        <div  className="topic-buttons">
          <div className="mButtonContainer" onClick={this.handleSwitch}>
            {btnData.map((v,i)=>(
              <MatrixButton key={v.btnName} id={`${i}_btn`}  btnName={v.btnName} cName={this.state.btnClassName[i]}></MatrixButton>))}
          </div>
          <div className="topic-apply" onClick={this.handleApply}>
            <MatrixButton id="topic-apply-button"  btnName="filter" cName="topic-apply-button"></MatrixButton>
          </div>
          <div className="btn-container">
              {/* {btn_urls.map((url,i)=>(<CircleBtn onClick={handleClick[i]} key={url+'-'+i} url={url} />))} */}
              {
                Array(4).fill(null).map((e,i)=>
                (<CircleBtn key={'btn2-'+i} type={i} onClick={handleClick[i]} />))
              }
          </div>   
        </div>
        <div  className="topicViewChart-container">
          <svg
            left="0"
            top="0"
            ref={this.$container}
            width={ WIDTH}
            height={ HEIGHT} 
            viewBox = {`0 0 ${WIDTH} ${HEIGHT}`}
          >
            {/* 绘制矩阵子集 */}
            {
              rectTreeData.length==0?null:
              rectTreeData.map((v,i)=>(
                <g 
                  onMouseOver={this.handleMouseenter}
                  onMouseOut = {this.handleMouseout}
                  key={`rectLeaf-${i}`} 
                  transform={`translate(${v.x0},${v.y0})`}
                >   
                  <RectLeaf
                    index ={i}
                    parentPos ={[v.x0,v.y0]}
                    width = {v.x1-v.x0}
                    height = {v.y1-v.y0}
                    data = {topicData[i]}
                  >
                  </RectLeaf>
                </g>
              ))
            }
            {/* 绘制各个矩阵的竖向滑块 */}
            {
              sliderWeights.length==0?null:
              sliderWeights.map((v,i)=>(
                <g key={`svg_slider_${i}`} transform={`translate(${rectTreeData[i].x0},${rectTreeData[i].y0})`}>
                  <SvgSlider
                    
                    height={sliderHeight}
                    width={sliderWidth}
                    weight={v}
                    index = {i}
                    onMouseDown = {this.handleSliderMouseDown}
                    onMouseMove = {this.handleSliderMouseMove}
                    onMouseUp = {this.handleSliderMouseUp}
                    onMouseOut = {this.handleSliderMouseOut}
                  >
                  </SvgSlider>
                </g>
                
              ))
            }
            {/* 绘制tooltip */}
            <g 
                transform = {`translate(${this.state.changeX},${this.state.changeY+5})`}
                visibility={this.state.tipVisibility}
              >
                <rect className="tooltip-g"
                  width="50"
                  height="15" 
                  opacity="0.5"
                  fill="#ffffff">
                </rect>
                <text 
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
        </div>
      </div>
      
    )
  }
}

const mapStateToProps = (state)=>({
  topicView:state.topicView,
  topicWeight:state.topicWeight,
  historyData:state.historyData,
  step: state.otherStep["6"],
  currentStep:state.otherStep["9"],
  KEY: state.KEY,
})


const mapDispatchToProps = {
  updateTopicView,
  initTopicWeight,
  updateSelectList,
  updateMatrix,
  updateTimeLine,
  updateTopicWeight,
  updateTopicLrs,
  setPerson,
  updateGroupdata
}

export default connect(mapStateToProps,mapDispatchToProps)(TopicTreeMap);

function rectFilter(data,singleBrush){
  let {addOrMinus,brushTransX,brushTransY,brushWidth,brushHeight} = singleBrush
  let cData=data.cData
  let x1,x2,y1,y2
  //将框选转换成相应横纵轴范围
  x1 = brushTransX
  x2 = brushTransX+brushWidth
  y1 = brushTransY
  // y1 = Math.ceil(y1)
  y1=y1>0?y1:0;
  y2 = brushTransY+brushHeight
  y2 = Math.ceil(y2)

  if(!addOrMinus){
    // 减数据

    for(let d of data){
      for(let v of d.cData){
        if(v.tx>=x1&&v.tx<=x2&&v.ty>=y1&&v.ty<=y2){
          v.isChoose=false
          v.personsId.map(vkey=>{
            if(brushPersons[vkey]){
              delete brushPersons[vkey]
            }
          })
        }
      }
    }
  }else{
    // 加数据
    for(let d of data){
      for(let v of d.cData){
        if(v.tx>=x1&&v.tx<=x2&&v.ty>=y1&&v.ty<=y2){
          v.isChoose=true
          v.personsId.map((vkey,i)=>{
            if(!brushPersons[vkey]){
              brushPersons[vkey] = v.persons[i]
            }
          })
          
        }
      }
    }
  }
}

function brushFilter(topicData,that){
  //被选中的人名
  // console.log("topicData",topicData)
  let data = deepClone(topicData)
  let tempSliderWeights = [...that.props.topicWeight]
  let i = 0
  while(i<data.length){
    let j=0
    let cData = data[i].cData
    while(j<cData.length){
      if(!cData[j].isChoose){
        cData.splice(j,1)
      }else{
        cData[j].isChoose=false
        j++
      }
    }
    if(cData.length == 0){
      // 该topic为空了，则去掉该数据
      data.splice(i,1)
      // 删除掉对应的topic比重数据 
      tempSliderWeights.splice(i,1)
    }else{
      i++
    }
  }
  if(data.length===0){
    //选择数据为0，则需要将topicWeight的reducer恢复到初始状态
    tempSliderWeights = that.props.topicView.map(v=>v.weight)
  }

  that.props.initTopicWeight(tempSliderWeights)
  // cData = newCirData
  return data
}

function adjustTreeMapUI(that){
  // console.log("拖拽结束");
  dragFlag = false
  sliderTimer = setTimeout(function(){
    // 更新布局
    topicData[sliderIndex].weight = that.props.topicWeight[sliderIndex]
    
    that.props.updateTopicView(topicData)
    // 向后端发起请求，更新降维图
    let topic_weights= {}
    topicData.forEach((v,i)=>{
      topic_weights[v.id] = sliderWeights[i]
    })
    let param ={
      topic_weights,
      ...that.props.historyData
    }
    that.props.updateTopicLrs(param, that.props.KEY, that.props.step)
  },1000)
}