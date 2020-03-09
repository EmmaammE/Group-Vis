import React from 'react';

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
   
    
    return (
      <g  transform={`translate(${rowOrColumn?0:gxy(index)},${rowOrColumn?gxy(index):0})`}>
        {data.map((v,i)=>(
            <g  key={`text_${i}`}>
              <circle
                cx={rowOrColumn?xy(v.distance):0}
                cy={rowOrColumn?0:xy(v.distance)}
                onMouseOver={this.handleMouseover}
                onMouseOut={this.handleMouseout}
                r = {4}
                fill={colorMap(v.value)}
              >
              </circle>
            </g>
            
          ))
        }
      </g>     
      
    )
  }
}

export default SeqCircles;
