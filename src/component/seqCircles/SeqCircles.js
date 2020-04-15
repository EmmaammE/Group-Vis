import React from 'react';
import './seqCircles.css'
import leaf from '../../assets/leaf/leaf.svg'
import leaf_choose from '../../assets/leaf/leaf_choose.svg'
import leaf2 from '../../assets/leaf/leaf2.svg'
import leaf2_choose from '../../assets/leaf/leaf2_choose.svg'
import leaf3 from '../../assets/leaf/leaf3.svg'
import leaf3_choose from '../../assets/leaf/leaf3_choose.svg'

let leafSrc = [leaf,leaf2,leaf3]
let leafSrcChoose = [leaf_choose,leaf2_choose,leaf3_choose]

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
    v.target.setAttribute("fill","red")
  }

  handleMouseout(v){
    v.target.setAttribute("fill","none")
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
    let rWidth = 12
    return (
      <g  transform={`translate(${rowOrColumn?0:gxy(index)},${rowOrColumn?gxy(index):0})`}>
        {data.map((v,i)=>(
          
              // <circle
              //   className = "seqCircle_timeLine"
              //   key={`text_${i}`}
              //   cx={rowOrColumn?xy(v.distance):0}
              //   cy={rowOrColumn?0:xy(v.distance)}
              //   onMouseOver={this.handleMouseover}
              //   onMouseOut={this.handleMouseout}
              //   info={`${index}_${v.distance}_${v.discription}`}
              //   r = {r?r:5}
              //   fill={v.isChoose?"red":"gray"}
              //   stroke="white"
              //   opacity={opacity?opacity:1}
              // >
              // </circle>
              <image
                key={`timeline_image_${i}`}
                className="timeline_image"
                x={rowOrColumn?xy(v.distance)-rWidth/2:-rWidth/2}
                y={rowOrColumn?-rWidth/2:xy(v.distance)-rWidth/2}
                onMouseOver={this.handleMouseover}
                onMouseOut={this.handleMouseout}
                fill="none"
                info={`${index}_${v.distance}_${v.discription}`}
                width={rWidth} 
                height={rWidth}
                xlinkHref={v.isChoose?leafSrcChoose[0]:leafSrc[0]}
              />
            
          ))
        }
      </g>     
      
    )
  }
}

export default SeqCircles;
