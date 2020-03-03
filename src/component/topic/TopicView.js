import React from 'react';
import Lable from '../lable/Lable'
import SeqCircles from '../seqCircles/SeqCircles'
import {scaleFactory,circleData,relationData} from './util';
import Arrow from'./Arrow'

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
    let margin={left:60,top:70,right:10,bottom:50}
    let width = WIDTH-margin.left-margin.right
    let height = HEIGHT -margin.top-margin.bottom
    const {yScale,xScale,colorMap,value,vScale} = scaleFactory(width,height,circleData,START_COLOR,END_COLOR)
    let rLabels = circleData.map(v=>v.name)
    let cData = circleData.map(v=>v.info)
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
                rotate={90}
                anchor={"end"}
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

export default TopicView;
