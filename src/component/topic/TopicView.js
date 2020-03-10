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

class TopicView extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      tooltip:"tooltip",
      visibility:"hidden",
      x:"0",
      y:"0",
      changeX:"50",
      changeY:"50",
      highRowLabel:-1
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
  }
  handleMouseenter(v){
    if(v.target.localName=="circle"){
      let targetWidth = Number(v.target.getAttribute("width"));
      let infos = v.target.getAttribute("info").split("_")
      // console.log("info",infos);
      let xChange = v.clientX- this.state.x
      let yChange = v.clientY- this.state.y-targetWidth*3;
      let displayInfo = Number(infos[2]).toFixed(5)

      this.setState({
        tooltip:displayInfo,
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
          <svg ref={this.$container} width="95%" height="100%"  viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
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
                visibility={this.state.visibility}
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
          </svg>
        </div>
      </div>
      
    )
  }
}

export default connect(state=>state.topicData)(TopicView);
