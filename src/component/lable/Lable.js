import React from 'react';
import * as d3 from 'd3';



let colorScheme = d3.schemeCategory10

class Lable extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
  }

  render(){
    const data = this.props.data
    // console.log("label",data,this.props)
    const rowOrColumn=this.props.rowOrColumn
    const xy = this.props.xy
    const trans = this.props.translate
    const rotate = this.props.rotate
    const anchor = this.props.anchor
    const highLable = this.props.highLable
    const fontSize = this.props.fontSize
    const colorful = this.props.colorful
    return (
      <g transform={`translate${trans}`}>
        {data.map((v,i)=>(
            <g 
              transform={`translate(${rowOrColumn?xy(i):0},${rowOrColumn?0:xy(i)})`}
              key={`text_${i}`}>
              <text
                x={0}
                y={3}
                fontSize={fontSize?fontSize:"0.7em"}
                textAnchor={anchor}
                fill={`${highLable==i?"red":(colorful?colorScheme[i]:"black")}`}
                transform={`rotate(${rotate}) scale(0.8)`}
              >
                {v}
              </text>
            </g>
            
          ))
        }
      </g>     
      
    )
  }
}

export default Lable;
