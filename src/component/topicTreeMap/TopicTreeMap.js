import React from 'react';
import Lable from '../lable/Lable'
import * as d3 from 'd3';
import SeqCircles from '../seqCircles/SeqCircles'
import {scaleFactory,
      filterTimeLine, 
      filterMatrixView,
      filterSelectList,
      filterBrushSelectList,
      filterMapView,
      smallize, 
      reduceRelationData,
      rectTree,
      reduceOpacity,
      boolRectToPolygon,
      addOpacity,
      filterRelationData,
      maxItem,
      dealCompare,
      maxLabel} from './util';
import {deepClone} from '../../util/tools'
import Arrow from'./Arrow'
import './topicTreeMap.css'
import FlowerLabel from '../flowerLabel/FlowerLabel'
import RectSlider from '../rectSlider/RectSlider'
import { connect } from 'react-redux';
// import VerticalSlider from '../verticalSlider/VerticalSlider';
import RowSlider from '../verticalSlider/RowSlider'
// import SvgSlider from '../verticalSlider/SvgSlider';
import MatrixButton from '../button/MatrixButton'
import CircleBtn from '../button/circlebtn';
import {updateTopicView} from '../../redux/topicView.redux.js'
import {initTopicWeight} from '../../redux/topicWeight.redux.js'
import {updateTimeLine} from '../../redux/timeLine.redux.js'
import {updateMatrix,initPeopleCommon} from '../../redux/matrixView.redux.js'
import {updateSelectList} from '../../redux/selectList.redux.js'
import {updateTopicWeight,updateTopicLrs} from '../../redux/topicWeight.redux.js'
import RectLeaf from './rectLeaf/RectLeaf'
import { setPerson } from '../../actions/data'
import {updateGroupdata, fetchTopicData, removeTopic} from '../../actions/step.js'
import Tip from '../tooltip/Tip'
import leaf from '../../assets/leaf/leaf.svg'
import {TOPICS} from '../../util/name.js'
import Motion from '../motion/Motion'


const btnData = [
      {btnName:"Add"},
      {btnName:"Minus"},
      {btnName:"Clear"}
    ]
let addOrMinus = true;
let margin={left:15,top:10,right:15,bottom:15}
const WIDTH = 500;
const HEIGHT = 470;

// const apriori = require('simple-apriori');
let brushPersons = {}
let singleFilterData = {}
// 存放框选集合的数据集，每个多边形对应一个数据集，该数据集是对象
let polygonsData = []

let brushDatas={};
let polygons = [];
let startLoc=[];
let brushWidth;
let brushHeight;
let svgWidth ,svgHeight;
let svgRatio
let brushFlag=false;
let topicData=[];


let sliderIndex = -1
let dragFlag = false
let sliderTimer = null
let sliderWeights=[]

let topicViewState
let originTotalWeight = 0 
let originWeights = {}

class TopicTreeMap extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      btnClassName:["choose_btn","",""],
      highRowLabel:-1,
      brushVisibility:"hidden",
      brushTransX:0,
      brushTransY:0,
      brushWidth:0,
      brushHeight:0,
      brushDatas:[],
      polygons:[],
      opacity:1,
      selectedTopicIndex:0,
      tipHasX:false,
      tipTitle:"topicName",
      tipData:[],
      tipStyle:{
        visibility:"hidden"
      },
      activeBtnIndex:4
    }
    this.$container = React.createRef();
    this.$ratio = React.createRef();
    this.handleMouseenter = this.handleMouseenter.bind(this)
    this.handleMouseout = this.handleMouseout.bind(this)
    this.handleClickX = this.handleClickX.bind(this)

    this.handleSliderInput = this.handleSliderInput.bind(this)
    
    this.handleAdd =this.handleAdd.bind(this)
    this.handleMinus = this.handleMinus.bind(this)
    this.handleClear = this.handleClear.bind(this)
    this.handleFilter =this.handleFilter.bind(this)
    this.handleDeleteTopic = this.handleDeleteTopic.bind(this)

    this.handleClickSelectList = this.handleClickSelectList.bind(this)
    this.handleClickMatrixView = this.handleClickMatrixView.bind(this)
    this.handleClickTimeLine = this.handleClickTimeLine.bind(this)
    this.handleClickMapView = this.handleClickMapView.bind(this)

    this.handleRectLeafClick = this.handleRectLeafClick.bind(this)
    this.handleClickPolygons =  this.handleClickPolygons.bind(this)
  
  }

  componentDidMount(){
    const that = this
    let container = this.$container.current
    // console.log("container",container.clientWidth,container.clientHeight)
    svgWidth =  container.clientWidth
    svgHeight = container.clientHeight
    svgRatio = svgWidth/WIDTH < svgHeight/HEIGHT ? svgWidth/WIDTH : svgHeight/HEIGHT
    let svg =  d3.select(container)
    svg.on("mousedown",function(e){
      if(!dragFlag&&d3.event.target.localName!="circle"){
        // console.log("svg-mousedown",d3.event.offsetX,d3.event.offsetY,d3.event)
        startLoc = [d3.event.offsetX/svgRatio,d3.event.offsetY/svgRatio]
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
        let nowX = d3.event.offsetX/svgRatio
        let nowY = d3.event.offsetY/svgRatio
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
        
        // 避免微小移动带来的计算，加一个限制
        if(brushWidth>5&&brushHeight>5){
          rectFilter(topicData,singleBrushData)
          // 加选才绘制，减选不绘制
          let boolResult = boolRectToPolygon(addOrMinus,polygons,singleBrushData,polygonsData,singleFilterData)
          polygons = boolResult.result
          polygonsData = boolResult.pData
          let tempPolygons = polygons.map(v=>{
            let vArray = v.map(point=>point.join(","))
            return vArray.join(" ")
          })
          // console.log("polygons---polygonsData",polygons,polygonsData)
          that.setState({polygons:tempPolygons})
        }
        

        brushWidth = 0
        brushHeight = 0
        that.setState({
          brushVisibility:"hidden",
          brushWidth:0,
          brushHeight:0,
          brushTransX:0,
          brushTransY:0
        })
        //  高亮xxx-view......

        let brushPersonsId = Object.keys(brushPersons)
        // console.log("brushPersons",brushPersons,brushPersonsId)
        let personsIdObject = [...brushPersonsId]
          .reduce((acc, e) => ({...acc, [e]:true}), {})
        that.props.setPerson(personsIdObject)

        // 挑出刷选的selectList
        
        let selectListData= filterBrushSelectList(topicData)
        if(selectListData.length>0){
          that.props.updateSelectList({selectListData})
        }
        
      }
    })
  }
  
  componentDidUpdate(prevProps) {
    if(prevProps.step !== this.props.step) {
      try {
        this.handleClear()
      } catch(e) {
        console.log(e)
      }
    }
  }

  // 下面两个函数为hover之后弹出tooltip的事件处理函数
  handleMouseenter(v){
    if(v.target.localName=="path"){
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

  // 此为滑块调节的响应函数
  handleSliderInput(e){
      let that = this
      let temp = e.target.value
      let ratioDom = this.$ratio.current
      ratioDom.innerHTML = `${temp}%`
      e.target.value = temp
      // 填充滑块有值部分，backgound-size转化为驼峰命名的方法
      e.target.style.backgroundSize = `${temp}% 100%`

      this.handleClear()
      if(sliderTimer){
        clearTimeout(sliderTimer)
      }
      
      sliderTimer = setTimeout(()=>{

        /**更新布局**/
        sliderIndex = this.state.selectedTopicIndex
        // 根据比例计算该topic的实际比重是多少
        temp = (originTotalWeight*temp)/100
        // 记录该选中topic之前及之后，其余topic的总值
        let restTotalWeight = originTotalWeight - topicData[sliderIndex].weight
        let newTotalWeight = originTotalWeight - temp
        // 记录该topic的label
        let lastLabel = topicData[sliderIndex].label
        

        //更新该topic的值
        topicData[sliderIndex].weight = temp
        
        // 对其余weight的值，等比例变化
        topicData.forEach(v=>{
          if(v.label!=lastLabel){
            v.weight = Number((v.weight*newTotalWeight/restTotalWeight).toFixed(2))
          }
        })
        // 重新对topicData进行排序
        // topicData中存放的weight是实际值
        topicData.sort((a,b)=>b.weight-a.weight)
        // console.log(topicData)
        let newIndex = 0
        // 找到该topic在下一轮布局中的位置
        topicData.forEach((v,i)=>{
          if(v.label==lastLabel){
            newIndex = i
          }
        })


        // 更新选中的topic的序号
        that.setState({
          selectedTopicIndex:newIndex
        })

        // 更新降维图所需要的topicWeights
        let topic_weights= {}

        // 取出该topicView的原始topicData，更新其topic的weight，然后更新group中topicData的值
        let updateTopicData = deepClone(this.props.topicView)
        updateTopicData.forEach(v=>{
          if(v.label===lastLabel){
            v.weight = temp
          }else{
            v.weight = Number((v.weight/restTotalWeight*newTotalWeight).toFixed(2))
          }
          topic_weights[v.id] = Number(v.weight.toFixed(2))
        })
        let step = this.props.currentStep
        this.props.updateGroupdata("topicView",step,updateTopicData)

      
        let param ={
          topic_weights,
          adjust_topic_weights_params:that.props.historyData
        }
        that.props.updateTopicLrs(JSON.stringify(param), that.props.KEY, that.props.step)
      },1000)
  }

  handleClear(){
    // 框选框数据都进行消除
    polygons = []
    this.setState({polygons})
    // topicData中叙述被选中的进行清除
    brushPersons = {}
    clearChoosed(topicData)
    // 取消XXX-view所有高亮的人
    this.props.setPerson({});

    let cStep = this.props.currentStep;
    let originData = this.props.group[cStep]["mapView"];
    for(let key in originData['sentence2pos']) {
        originData['sentence2pos'][key].show = true;
    }
    this.props.updateGroupdata("mapView", cStep, originData)
  }

  // 此为切换加选还是减选框的按钮事件函数
  handleAdd(v){
    addOrMinus=true;
    this.setState({activeBtnIndex:4})
  }
  handleMinus(v){
    addOrMinus=false;
    this.setState({activeBtnIndex:5})
  }
  handleSwitch(v){
    
    let index = v.target.id.split("")[0]
    if(Number(index)===2){
      // console.log("index",index)
      // 框选框数据都进行消除
      polygons = []

      this.setState({polygons})
      // topicData中叙述被选中的进行清除
      brushPersons = {}
      clearChoosed(topicData)
      // 取消XXX-view所有高亮的人
      this.props.setPerson({});
      

    }else{
      let classList = v.target.className.split(" ")
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
    
  }

  // apply按钮的事件，将数据刷选的结果应用到topicView
  handleFilter(){
    let that = this
    // reduceOpacity为将透明度减为0
    // filterCountData为计算本视图更新后的数据
    // filterFetchData为依据本视图的框选出的参数去后端取数据操作
    // 以上三者并发执行，待都完成之后

    // 清楚框选操作
    polygons = []
    that.setState({polygons})
    // 取消XXX-view所有高亮的人
    that.props.setPerson({});
    that.setState({
      selectedTopicIndex:0
    })
    clearChoosed(topicData)

    let filterPersons = {...brushPersons}
    brushPersons = {}  
    // filterPersons是刷选涉及到的人
    // ANCHOR create a new flower
    let param = new FormData();
    for(let key in filterPersons) {
      param.append("person_ids[]", key);
    }
    that.props.fetchTopicData(param,that.props.KEY, that.props.latestStep+1,1)

  }

  handleDeleteTopic(){
    let deleteTopicId = topicData[this.state.selectedTopicIndex].id
    let that = this
    // console.log("deleteTopicId",deleteTopicId)
    // 拿到该topic的Id，删除它，重新计算花朵数据，及右边视图数据，然后更新
    // 其实应该是先更新topicView视图的数据，然后依次去更新右边四个视图的数据
    // topicView数据本身就可以更新右边三个视图的数据
    // 在更新花朵的数据
    // 更新花朵group数据中其它视图中存储的数据
    let cStep = this.props.currentStep

    this.props.removeTopic(deleteTopicId, cStep);

    topicData.splice(this.state.selectedTopicIndex,1)
    this.setState({
      selectedTopicIndex:0
    })
    this.props.updateTopicView(topicData)
    this.props.updateGroupdata("topicView",cStep,topicData)
    
    let selectListData= filterSelectList(topicData,true)
    this.props.updateSelectList({selectListData})
    this.props.updateGroupdata("selectView",cStep,{selectListData})

    let matrixViewData = filterMatrixView(that,topicData,true)
    this.props.updateGroupdata("matrixView",cStep,matrixViewData)

    let timeLineData = filterTimeLine(topicData,true)
    this.props.updateTimeLine(timeLineData)
    this.props.updateGroupdata("timelineView",cStep,timeLineData)

    let data = filterMapView(topicData, true, deleteTopicId);
    let originData = this.props.group[cStep]["mapView"];
    for(let key in originData['sentence2pos']) {
      if(data.has(key)) {
        originData['sentence2pos'][key].show = false;
      } else {
        originData['sentence2pos'][key].show = true;
      }
    }
    this.props.updateGroupdata("mapView", cStep, originData)

    // this
    let weights = this.props.group[cStep][TOPICS]
    let i = 0
    while(i<weights.length){
      if(weights[i].id ===deleteTopicId){
        weights.splice(i,1)
        break
      }else{
        i++
      }
    }

    this.props.updateGroupdata([TOPICS],cStep,weights)
    // console.log("weights",weights)
  }
  // 右上角的四个按钮的 注册事件
  //  selectList视图
  handleClickSelectList(){
    let selectListData
    if(this.state.polygons.length===0){
      selectListData= filterSelectList(topicData,true)
    }else{
      selectListData= filterSelectList(topicData)
    }
    
    this.props.updateSelectList({selectListData})
  }
  //  Matrix View视图
  handleClickMatrixView(){
    let that = this
    if(this.state.polygons.length===0){
      filterMatrixView(that,topicData,true)
    }else{
      filterMatrixView(that,topicData)
    }
    
  }
  //  timeLine视图
  handleClickTimeLine(){
    let timeLineData
    if(this.state.polygons.length===0){
      timeLineData = filterTimeLine(topicData,true)
    }else{
      timeLineData= filterTimeLine(topicData)
    }
    this.props.updateTimeLine(timeLineData)
  }

  // mapView视图按钮
  handleClickMapView(){
    let step = this.props.currentStep;
    let data;
    if(this.state.polygons.length===0){
      data = filterMapView(topicData, true)
    }else{
      data = filterMapView(topicData)
    }

    let originData = this.props.group[step]["mapView"];
    for(let key in originData['sentence2pos']) {
      if(data.has(key)) {
        originData['sentence2pos'][key].show = false;
      } else {
        originData['sentence2pos'][key].show = true;
      }
    }

    this.props.updateGroupdata("mapView", step, originData)
  }

  handleRectLeafClick(e){
    // console.log("rest",e.target)
    if(e.target.localName=="rect"||e.target.localName==="foreignObject"||e.target.localName==="p"){
      
      let index = e.target.getAttribute("index")    
      // console.log("rest",index)
      this.setState({
        selectedTopicIndex:index
      })
    }
    if(e.target.localName=="path"){
      let that = this
      let tipHasX = true
      popUp(that,tipHasX,e)
    }
  }

  handleClickPolygons(e){
    if(e.target.localName=="polygon"){
      let that = this
      let tipHasX = true
      let index = e.target.getAttribute("index")
      // ids是序列数组

      let ids = Object.keys(polygonsData[index]).map(v=>v.split(" ").join(", "))
      // console.log("ids",ids)

      let maxItems = maxItem(ids,that)
      let tipStyle = {
        left:e.clientX,
        top:e.clientY,
        visibility:"visible"
      }
      try{
        that.setState({
          tipHasX:tipHasX,
          tipData:maxItems?maxItems:null,
          tipTitle:"Frequent Itemsets",
          tipStyle:tipStyle
        })
      }catch{
        console.error('显示最大频繁子序列时出错' );
      }
      
    }
  }

  

  render(){
    // 当topicData0时，或者this.props.topicView变化时更新
    let topicPropsUpdateFlag = false
    if(topicData.length===0||topicViewState!==this.props.topicView){
      // 进入这个判断条件说明，数据源被切换
      topicViewState = this.props.topicView
      originTotalWeight = 0
      topicViewState.forEach(v=>{
        // 计算该视图的所有topicweight的总和
        originTotalWeight+=v.weight
        // 存储原始的topic的weight值
        originWeights[v.id ]= v.weight
      })
      topicData = deepClone(this.props.topicView)
      topicPropsUpdateFlag = true
      
    }
    let rectTreeData=[],rectGroupData=[]
    // 如果该视图依赖的props.topicView数据发生变动，则index设置为0
    let index = topicPropsUpdateFlag?0:this.state.selectedTopicIndex
    let selectedRect
    let selectedWeight
    if(topicData.length>0){
      let tempData = rectTree(WIDTH-margin.right,HEIGHT-margin.bottom,topicData)
      rectTreeData = tempData.rectTreeData
      rectGroupData = tempData.rectGroupData
      sliderWeights = topicData.map((v,i)=>{
        return v.weight/originTotalWeight*100
      })
      selectedRect = rectTreeData[index]    
      selectedWeight = Number(sliderWeights[index]).toFixed(0);
    }

    let handleClick = []
    handleClick.push(this.handleClickTimeLine)
    handleClick.push(this.handleClickMatrixView)
    handleClick.push(this.handleClickMapView)
    handleClick.push(this.handleClickSelectList)
    handleClick.push(this.handleAdd)
    handleClick.push(this.handleMinus)
    handleClick.push(this.handleClear)
    handleClick.push(this.handleDeleteTopic)
    handleClick.push(this.handleFilter)
    return (
      <div className=" chart-wrapper topic-view-container">
        <div className="topic-buttons btns-container">
            {
              Array(4).fill(null).map((e,i)=>
              (<CircleBtn key={'btn2-'+i} type={i} onClick={handleClick[i]} />))
            }
        </div>
        <div className="topicView-header">
          
          <div className="header-left">
            <div className="g-chart-title">Feature Explorer</div>
            <div className="brush-btn-container">
                {
                  Array(5).fill(null).map((e,i)=> (
                  <CircleBtn 
                        key={'brush-btn-'+i} 
                        active={(i+4)==this.state.activeBtnIndex?false:true}
                        type={i+4} 
                        onClick={handleClick[i+4]} 
                  />))
                }
            </div> 
          </div>

          {
            topicData.length>0&&<div className = "rowSlider-container">
              <RowSlider
                handleSliderInput={this.handleSliderInput}
                weight = {selectedWeight}
                topicName = {topicData[index].label}
              ></RowSlider>
              <div id = "rightRatio"  ref={this.$ratio} className="rightRatio g-text">{`${selectedWeight}%`}</div>
            </div>
          }
          
          <div className = "topicView-label-container">
            <div className="topic-leaf-label">
                <svg width="12px" height="12px">
                  <image
                    width="100%" 
                    height="100%" 
                    xlinkHref={leaf}
                  />
                </svg>
              <p className="g-text">Description</p>
            </div>
            <div className="topic-leaf-label">
                <svg width="12px" height="12px">
                  <rect
                    transform = "translate(0,6)"
                    fill="#e8c6bf"
                    width = "12px"
                    height= "6px" 
                  >
                  </rect>
                  <rect
                    stroke="#c36958"
                    fill="none"
                    strokeWidth = "1.5"
                    width = "12px"
                    height= "12px"
                  >
                  </rect>
                </svg>
                <p className="g-text">Proportion</p>
            </div>
          </div>
        </div>
        <div  className="topicViewChart-container">
          <svg
            ref={this.$container}
            width="100%"
            height="100%"
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            opacity = {this.state.opacity}
            preserveAspectRatio="xMinYMin"
            className = "topicTreeMap-svg"
            // onMouseMove = {this.handleSliderMouseMove}
            // onMouseUp = {this.handleSliderMouseUp} 
          >
            {/* 绘制矩阵子集 */}
            {
              rectTreeData.length>0&&rectTreeData.map((v,i)=>(
                // <RectLeaf
                //   index ={i}
                //   parentPos ={[v.x0,v.y0]}
                //   width = {v.x1-v.x0}
                //   height = {v.y1-v.y0}
                //   data = {topicData[i]}
                // >
                // </RectLeaf>
                <Motion 
                  duration={2500} 
                  key = {`${i}_motion`}
                  style={{
                      width:v.x1-v.x0,
                      height:v.y1-v.y0,
                      parentX:v.x0,
                      parentY:v.y0
                  }}
                >
                {({width,height,parentX,parentY}) =>
                  <g 
                    onMouseOver={this.handleMouseenter}
                    onMouseOut = {this.handleMouseout}
                    onClick = {this.handleRectLeafClick}
                    key={`rectLeaf-${i}`} 
                    transform={`translate(${parentX},${parentY})`}
                  >
                    <RectLeaf
                      index ={i}
                      parentPos ={[parentX,parentY]}
                      width = {width}
                      height = {height}
                      data = {topicData[i]}
                    >
                    </RectLeaf>
                    
                  </g>}
                </Motion>  
              ))
            }
            {/* 绘制topic组的矩阵 */}
            {
              rectGroupData.length>0&&rectGroupData.map((v,i)=>(
                <Motion
                  duration={2500} 
                  key = {`${i}_motion_group`}
                  style={{
                      width:v.x1-v.x0,
                      height:v.y1-v.y0,
                      parentX:v.x0,
                      parentY:v.y0
                  }}
                >
                {({width,height,parentX,parentY})=>
                  height>0&&<rect
                    key={`rectGroup-${i}`} 
                    width = {width}
                    height = {height}
                    fill= "none"
                    stroke= "#b4432e"
                    strokeWidth = "3.5"
                    transform={`translate(${parentX},${parentY})`}
                  > 
                  </rect>
                }
                </Motion>
                
              ))
            }
            {/* 绘制选中topic的框 */}
            {
              rectTreeData.length>0&&
              <Motion
                duration={2500} 
                style={{
                    width:selectedRect.x1-selectedRect.x0,
                    height:selectedRect.y1-selectedRect.y0,
                    parentX:selectedRect.x0,
                    parentY:selectedRect.y0
                }}
              >
                {({width,height,parentX,parentY})=>
                  height>0&&<g transform={`translate(${parentX},${parentY})`}>
                    <rect
                      stroke="#333333"
                      strokeWidth = "2.5"
                      fill="none"
                      width = {width}
                      height = {height}
                    ></rect>
                </g>
                }
              </Motion>
              
              
            }
            {/* 绘制已经存在的刷选框 */}
            <g className="exsit-brush-rects">
              {
                this.state.polygons.map((v,i)=>(
                  <polygon
                    key={`exsit-brush-${i}`}
                    onClick = {this.handleClickPolygons}
                    index={i}
                    className="brush"
                    points={v}
                    style={{fill:"#eeeeee", stroke:"black", strokeWidth:2, opacity:0.4}}
                  >
                  </polygon>
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
                opacity="0.5"
                strokeWidth="2"
                stroke="black"
                fill="#eeeeee"
              >
              </rect>
            </g>
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
  topicView:state.topicView,
  topicWeight:state.topicWeight,
  historyData:state.historyData,
  step: state.otherStep["6"],
  currentStep:state.otherStep["9"],
  KEY: state.KEY,
  // 最新的step
  latestStep: state.step,
  dict:state.dict,
  group: state.group
})
// const mapStateToProps = (state)=>{

//   let step = state.otherStep["6"];
//     if(isNaN(Number(step)) && state.otherStep["6"]!==undefined) {
//         // 是群体对比的step
//         let steps = step.split('-')
//         let topicDataA = state.group[steps[0]]['topicView']
//         let topicDataB = state.group[steps[1]]['topicView']
//         let topicDataAB = state.group[step.join("-")]['topicView']

//         return {
//           topicView:dealCompare(topicDataA,topicDataB,topicDataAB),
//           topicWeight:state.topicWeight,
//           historyData:state.historyData,
//           step: state.otherStep["6"],
//           currentStep:state.otherStep["9"],
//           KEY: state.KEY,
//           // 最新的step
//           latestStep: state.step,
//           dict:state.dict,
//           group: state.group
//         }
//     } else {
//         // 非对比的情况
//         return {
//           topicView:state.topicView,
//           topicWeight:state.topicWeight,
//           historyData:state.historyData,
//           step: state.otherStep["6"],
//           currentStep:state.otherStep["9"],
//           KEY: state.KEY,
//           // 最新的step
//           latestStep: state.step,
//           dict:state.dict,
//           group: state.group
//         }
//     }
//   }


const mapDispatchToProps = {
  updateTopicView,
  initTopicWeight,
  updateSelectList,
  updateMatrix,
  updateTimeLine,
  updateTopicWeight,
  updateTopicLrs,
  setPerson,
  updateGroupdata,
  fetchTopicData,
  initPeopleCommon,
  removeTopic
}

export default connect(mapStateToProps,mapDispatchToProps)(TopicTreeMap);

function clearChoosed(data){
  for(let d of data){
    for(let v of d.cData){
        v.isChoose=false
    }
  }
}

function rectFilter(data,singleBrush){
  let {addOrMinus,brushTransX,brushTransY,brushWidth,brushHeight} = singleBrush
  let cData=data.cData
  singleFilterData = {}
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
          if(v.isChoose){
            v.isChoose=false
            v.personsId.map(vkey=>{
              if(brushPersons[vkey]){
                delete brushPersons[vkey]
              }
            })
            singleFilterData[v.id]={
              label:v.label,
              tx:v.tx,
              ty:v.ty
            }
          }
        }
      }
    }
  }else{
    // 加数据
    for(let d of data){
      for(let v of d.cData){
        if(v.tx>=x1&&v.tx<=x2&&v.ty>=y1&&v.ty<=y2&&!v.isChoose){
          v.isChoose=true
          v.personsId.map((vkey,i)=>{
            if(!brushPersons[vkey]){
              brushPersons[vkey] = v.persons[i]
            }
          })
          singleFilterData[v.id] = {
            label:v.label,
            tx:v.tx,
            ty:v.ty
          }
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
  return data
}


function popUp(that,tipHasX,v){
  let infos = v.target.getAttribute("info").split("_")
      let tipTitle = topicData[Number(infos[0])].label
      let targetData = v.target.getAttribute("discription")
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



