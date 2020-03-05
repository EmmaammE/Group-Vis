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

    }
  }

  componentDidMount(){
  }
  render(){
    // console.log("topivView中：",this.props)
    const data = {
      label2topics:this.props.label2topics,
      topic2sentence_positions:this.props.topic2sentence_positions,
      pmi_node:this.props.pmi_node
    }

    let topicData = handleData(data)
    // console.log("topicView中，topicData",topicData)
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
          <svg width="95%" height="100%"  viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            <g className="topic_Lables">
              <Lable 
                key={`lable_row`} 
                translate={`(${margin.left},${margin.top*0.8})`}  
                rowOrColumn = {true} 
                data={rLabels} 
                rotate={-90}
                anchor={"start"}
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
            <g transform={`translate(${margin.left},${margin.top})`} className="topic_circle_columns">
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
          </svg>
        </div>
      </div>
      
    )
  }
}

export default connect(state=>state.topicData)(TopicView);
