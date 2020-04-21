import React from 'react';
import * as d3 from 'd3';
import {
  getZeroStyle,
  shouldStopAnimation,
  stepCurrentStyle
} from './util.js'

// 上一次的状态用state中的lastStyle来记录
// 当下的状态用state中的currentStyle来记录，这也是要传递给子组件的
// 目标状态用this.props.style来记录
// 用时间来控制，根据初始状态和终点状态，以及中间的具体时刻，确定当下状态
// 当该组件初始化时，lastStyle应该是null，这是要根据目标状态做一个归零版的状态
// 

const msPerFrame = 1000/60
let clock = typeof performance === "object" && performance.now ? performance : Date
let setFrame = typeof window === "object" && window.requestAnimationFrame 
    ? window.requestAnimationFrame.bind(window) 
    : function(f) { setTimeout(f, 17); };

class Motion extends React.Component{
  
  constructor(props){
    super(props)
    this.state={
      lastStyle:null,
      currentStyle:null
    }
    // this.state = defaultState()
  }

  // 控制是否继续渲染
  unmounting = false
  wasAnimating = false
  // 类似于一个定时器的返回值，
  animationID = null
  prevTime = 0
  accumulatedTime = 0

  unreadPropStyle = null
  initFlag = false
  duration = 0

  
  defaultState(){
    const {defaultStyle, style} = this.props
    // const currentStyle = defaultState || stripStyle(style)
    // const currentVelocity = mapToZero(currentStyle)
  }

  // 该函数循环调用自身进行动画
  startAnimationIfNecessary(){

    if(this.unmounting||this.animationID){
      return 
    }

    this.animationID = setFrame(()=>{
      if(this.unmounting){
        return 
      }

      let propStyle = this.props.style
      if(shouldStopAnimation(this.state.currentStyle,propStyle)){
        this.animationID = null
        this.wasAnimating = false
        this.accumulatedTime = 0
        return 
      }
      // 进入渲染环节
       this.wasAnimating = true;
       const currentTime = clock.now()
       let timeRatio = (currentTime - this.prevTime)/this.prevTime
       timeRatio = timeRatio>1?1:timeRatio
       timeRatio = timeRatio<0?0:timeRatio
       this.prevTime = currentTime
       // 计算出当下时间所需要的属性差值
       let styleDelta = stepCurrentStyle(this.state.lastStyle,this.state.currentStyle,propStyle,timeRatio)
       this.setState(prevState=>{
         let newStyle = {
           lastStyle:{...prevState.lastStyle},
           currentStyle:{...prevState.currentStyle}
         }
         let cStyle = prevState.currentStyle
         for(let v in cStyle){
           if(typeof cStyle[v] === "number"){
              newStyle.currentStyle[v] +=styleDelta[v]
           }
         }
         return newStyle
       })
       this.startAnimationIfNecessary()
    })
  }

  componentWillUnmount(){
    this.unmounting = true
    // 如果还有渲染定时器事务进行中的话，取消
    if(this.animationID != null){
      // 取消定时器的任务

    }
  }

  UNSAFE_componentWillReceiveProps(props){
    // 如果不存在上一次的状态，则根据当下props初始化lastStyle
    if(!this.initFlag){
      this.initFlag = true
      let lastStyle = getZeroStyle(props.style)
      this.setState({lastStyle})
    }
    if(this.animationID == null){
      this.prevTime = clock.now()
      // 表示该动画持续多长时间
      this.duration = this.props.duration
      this.startAnimationIfNecessary()
    }
  }


  componentDidMount(){
    this.prevTime = clock.now()
    this.startAnimationIfNecessary()
  }

  render(){
    // 将this.state.currentStyle放入其子组件中，就是通过这步去传递参数
    const renderedChildren = this.props.children(this.state.currentStyle);
    // 当renderedChildren存在时，返回React.Children.only(renderedChildren)
    // 验证children里只有唯一的孩子并返回他。否则这个方法抛出一个错误。
    return renderedChildren && React.Children.only(renderedChildren);
  }
}

export default Motion
