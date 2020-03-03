import React from 'react';


class Lable extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
  }

  render(){
    const data = this.props.data
    const rowOrColumn=this.props.rowOrColumn
    const xy = this.props.xy
    const trans = this.props.translate
    const rotate = this.props.rotate
    const anchor = this.props.anchor
    return (
      <g transform={`translate${trans}`}>
        {data.map((v,i)=>(
            <g 
              transform={`translate(${rowOrColumn?xy(i):0},${rowOrColumn?0:xy(i)})`}
              key={`text_${i}`}>
              <text
                x={0}
                y={3}
                fontSize="0.7em"
                textAnchor={anchor}
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
