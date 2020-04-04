import React from 'react';
import './seqCircles.css'

class SeqCircles extends React.Component{
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
    const data = this.props.data
    const rowOrColumn=this.props.rowOrColumn
    const gxy = this.props.gxy
    const xy = this.props.xy
    const index = this.props.index
    const colorMap = this.props.colorMap
    const r = this.props.r
    const opacity = this.props.opacity
    return (
      <g  transform={`translate(${rowOrColumn?0:gxy(index)},${rowOrColumn?gxy(index):0})`}>
        {data.map((v,i)=>(
              <circle
                className = "seqCircle_timeLine"
                key={`text_${i}`}
                cx={rowOrColumn?xy(v.distance):0}
                cy={rowOrColumn?0:xy(v.distance)}
                onMouseOver={this.handleMouseover}
                onMouseOut={this.handleMouseout}
                info={`${index}_${v.distance}_${v.discription}`}
                r = {r?r:5}
                fill={v.isChoose?"red":"gray"}
                stroke="white"
                opacity={opacity?opacity:1}
              >
              </circle>
            
          ))
        }
      </g>     
      
    )
  }
}

export default SeqCircles;
