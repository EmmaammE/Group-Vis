import React from 'react';
import {rectLeafScale} from '../util.js'
import p1 from '../../../assets/img/p1.png'
import p2 from '../../../assets/img/p2.png'
import p3 from '../../../assets/img/p3.png'
const margin = {top:20,bottom:12,left:12,right:12}



class RectLeaf extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      highColor:""
    }

    this.handleMouseover = this.handleMouseover.bind(this)
    this.handleMouseout = this.handleMouseout.bind(this)
  }

  handleMouseover(v){
    // let tempColor = v.target.getAttribute("fill")
    // this.setState({
    //   highColor:tempColor
    // })
  }

  handleMouseout(v){
    // v.target.setAttribute("fill",this.state.highColor)
  }

  render(){
    
    const data = this.props.data
    const width = this.props.width-margin.left-margin.right
    const height = this.props.height-margin.top-margin.bottom
    const pHeight = Number((data.personRatio*this.props.height).toFixed(0))
    const transHeight = this.props.height-pHeight
    const {xScale,yScale} = rectLeafScale(data.cData,width,height)
    // console.log("xScale,yScale",xScale,yScale)
    const parentPos= this.props.parentPos
    let rWidth = 10
    let index = this.props.index
    return (
    <g>
      <rect
        stroke="#333333"
        // rx ="5"
        // ry="5"
        fill="none"
        strokeWidth = "0.5"
        width = {this.props.width}
        height= {this.props.height}  
      >
      </rect>
      <rect
        transform={`translate(0,${transHeight})`}
        fill="red"
        opacity="0.02"
        width = {this.props.width}
        height= {pHeight}  
      >
      </rect>
      <text  
        fill="#888888"
        x="4"
        y="12"
        textAnchor="start"
        fontSize="0.65em"
        transform="scale(0.85)"
        // zindex = "10"
      > 
        {data.label}
      </text>
      <g  
        zindex="11"
        transform={`translate(${margin.left},${margin.top})`}>
        
        {data.cData.map((v,i)=>{
            // 记录此花朵在整个svg中的位置
            data.cData[i].tx = parentPos[0]+margin.left+xScale(v.x)
            data.cData[i].ty = parentPos[1]+margin.top+yScale(v.y)
            let len = v.persons.length
          return <g 
            key={`${v.x}-${i}-${v.y}`}
            transform={`translate(${xScale(v.x)-5},${yScale(v.y)-5})`} >
              <rect
                className="reactLeaf_image"
                rx={rWidth/2+1}
                ry={rWidth/2+1}
                width={rWidth+2} 
                height = {rWidth+2} 
                fill="none"
                stroke={v.isChoose?"red":null}
                strokeWidth = "0.5"
              >
              </rect>
              <image
                className="reactLeaf_image"
                info={`${index}_${i}_${v.discription}`}
                discription = {v.discription}
                width={rWidth} 
                height={rWidth}
                xlinkHref={len>=3?p3:len==2?p2:p1}
              />
          </g> 
        })
        }
      </g>     
    </g>
    )
  }
}

export default RectLeaf;
