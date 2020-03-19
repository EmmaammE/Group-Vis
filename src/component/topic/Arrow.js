import React from 'react';


class Arrow extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
  }

  render(){
    const data = this.props.data
    const yScale = this.props.yScale
    const height = this.props.height
    return (
      <g>
        <defs>
          <marker 
            id="arrow_r"
            markerUnits="strokeWidth"
            markerWidth="12"
            markerHeight="12"
            viewBox="0 0 12 12"
            refX="6"
            refY="6"
            orient="auto">
              <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="red"/>
          </marker>
          <marker 
            id="arrow_b"
            markerUnits="strokeWidth"
            markerWidth="12"
            markerHeight="12"
            viewBox="0 0 12 12"
            refX="6"
            refY="6"
            orient="auto">
              <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="blue"/>
          </marker>
          <linearGradient
            id="rLinearColor"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgb(250,210,209)"></stop>
            <stop offset="100%" stopColor="red"></stop>
          </linearGradient>
          <linearGradient
            id="bLinearColor"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgb(210, 210, 250)"></stop>
            <stop offset="100%" stopColor="rgb(3,93,195)"></stop>
          </linearGradient>
        </defs>
        <g>
          {data.map((d)=>(
              <path
                key={`${d}`}
                d={`M 10 ${yScale(d[1])} Q ${50*(yScale(d[0])-yScale(d[1]))/height+10} ${(yScale(d[0])+yScale(d[1]))/2}  10 ${yScale(d[0])+3}`}
                fill="none"
                stroke={`url(#${d[2]>0?'r':'b'}LinearColor)`}
                strokeWidth="1"
                markerEnd={`url(#arrow_${d[2]>0?'r':'b'})`}
              >
              </path>
              
            ))
          }
        </g>
        
      </g>     
      
    )
  }
}

export default Arrow;