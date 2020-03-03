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
    // transform={`translate(${l},${t})`} 
    return (
      <g className="matrix_lable" transform={`translate(${l},${t})`} >
        {
          data.map((v,i)=>(
            <g 
              transform={`translate(${rowOrColumn?xy(i):0},${rowOrColumn?0:xy(i)})`}
              key={`text_${l}_${i}`}>
              <text
                x={rowOrColumn?2:0}
                y={rowOrColumn?0:10}
                fontSize="0.65em"
                textAnchor="end"
                transform="rotate(45) scale(0.9)"
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

export default LeftLable;
