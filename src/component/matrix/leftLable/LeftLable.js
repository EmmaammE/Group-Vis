import React from 'react';

class LeftLable extends React.Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }

  render(){
    const rowOrColumn = this.props.rowOrColumn
    const l=rowOrColumn?5:-3
    const t = rowOrColumn?-5:5
    const data = this.props.data
    const xy = this.props.xy
    const highLable = this.props.highLable
    // transform={`translate(${l},${t})`} 
    const rotate = this.props.rotate
    return (
      <g className="matrix_lable" transform={`translate(${l},${t})`} >
        {
          data.map((v,i)=>(
            <g 
              transform={`translate(${rowOrColumn?xy(i):0},${rowOrColumn?0:xy(i)})`}
              key={`text_${l}_${i}`}>
              <text
                x={rowOrColumn?2:0}
                y={rowOrColumn?0:5}
                fontSize="12px"
                textAnchor={rowOrColumn?"start":"end"}
                transform={`rotate(${rotate}) scale(0.85)`}
                fill={`${v.isChoose||highLable==i?"#ac422d":"black"}`}
              >
                {v.name}
              </text>
            </g>
            
          ))
        }
      </g> 
    )
  }
}

export default LeftLable;
