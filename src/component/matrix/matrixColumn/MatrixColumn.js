import React from 'react';


// 暂时的假数据


class MatrixColumn extends React.Component{
  constructor(props){
    super(props);
    this.state = {
    }
  }

  render(){
    const xy = this.props.xy
    const colorMap = this.props.colorMap
    const index = this.props.index
    const data = this.props.data
    return (
      <g transform={`translate(${xy(index)},0)`}>
        {data.map((v,i)=>(
          <rect 
            transform={`translate(0,${xy(i)})`}
            width={xy.bandwidth()}
            height= {xy.bandwidth()}
            strokeWidth={0}
            // 换成颜色标尺
            fill={colorMap(data[i])}
            key={`rect_${i}`}
            className="cell">
          </rect>
        ))
        }
      </g>
    )
  }
}

export default MatrixColumn;
