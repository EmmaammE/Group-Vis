import React from 'react';


// 暂时的假数据


class MatrixColumn extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      highColor:""
    }

    this.handleMouseover = this.handleMouseover.bind(this)
    this.handleMouseout = this.handleMouseout.bind(this)
  }
  handleMouseover(v){
    let tempColor = v.target.getAttribute("fill")
    this.setState({
      highColor:tempColor
    })
    v.target.setAttribute("fill","yellow")
  }

  handleMouseout(v){
    v.target.setAttribute("fill",this.state.highColor)
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
            onMouseOver={this.handleMouseover}
            onMouseOut={this.handleMouseout}
            className="cell">
          </rect>
        ))
        }
      </g>
    )
  }
}

export default MatrixColumn;
