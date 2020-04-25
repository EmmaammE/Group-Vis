import React from 'react';
import {rectLeafScale} from '../util.js'
import p1 from '../../../assets/img/p1.png'
import p2 from '../../../assets/img/p2.png'
import p3 from '../../../assets/img/p3.png'
import leaf from '../../../assets/leaf/leaf.svg'
import leaf_choose from '../../../assets/leaf/leaf_choose.svg'
import leaf2 from '../../../assets/leaf/leaf2.svg'
import leaf2_choose from '../../../assets/leaf/leaf2_choose.svg'
import leaf3 from '../../../assets/leaf/leaf3.svg'
import leaf3_choose from '../../../assets/leaf/leaf3_choose.svg'

import '../topicTreeMap.css'
const margin = {top:25,bottom:12,left:12,right:12}

let leafSrc = [leaf,leaf2,leaf3]
let leafSrcChoose = [leaf_choose,leaf2_choose,leaf3_choose]


class RectLeaf extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      highColor:""
    }

  }


  render(){
    // console.log("rectLeaf",this.props)
    
    const data = this.props.data
    const width = this.props.width-margin.left-margin.right
    //  求出标签长度占多少个字符
    let labelLength = data.label.split("").length
    // 算出该标题全部展开占横向距离多大，一个字符长度大概是13px
    let pxLength = labelLength * 13
    // 算出margin.top需要多少，一行占高度是16
    margin.top = Math.ceil(pxLength/width)*16+5
    // 使用差值动画的话，开始width会非常的小,可能会溢出变负
    // console.log("Math.ceil(pxLength/width)", Math.ceil(pxLength/width),margin.bottom)
    if(margin.top<0) return null
    
    const height = this.props.height-margin.top-margin.bottom
    if(height<=0) return null
    const pHeight = Number((data.personRatio*this.props.height).toFixed(0))
    const transHeight = this.props.height-pHeight
    const {xScale,yScale} = rectLeafScale(data.cData,width,height)
    // console.log("xScale,yScale",xScale,yScale)
    const parentPos= this.props.parentPos
    let rWidth = 12
    let index = this.props.index
    return (
    height>0&&<g>
      <rect
        stroke="#c68b54"
        // rx ="5"
        // ry="5"
        fill="white"
        strokeWidth = "1.5"
        width = {this.props.width}
        height= {this.props.height}
        index={index}  
      ></rect>
      <rect
        transform={`translate(0,${transHeight})`}
        fill="#f0dbd6"
        opacity="0.5"
        width = {this.props.width}
        height= {pHeight}  
        index={index} 
      >
      </rect>
      <rect
        stroke="#c36958"
        // rx ="5"
        // ry="5"
        fill="none"
        strokeWidth = "1.5"
        width = {this.props.width}
        height= {this.props.height}
        index={index}  
      >
      </rect>
      
      <foreignObject 
        width = {this.props.width}
        className = "foreign-rect-header" 
        index = {index}
      >
        <div
          className = "rect-header"
        >
          <p
            className = "rect-header-content"
            index={index} 
          >
           {data.label}
          </p>
        </div>
      </foreignObject>
      <rect
        fill="white"
        opacity = "0.01"
        width = {this.props.width}
        height= {margin.top}
        index={index}  
      >
      </rect>
      <g  
        zindex="11"
        transform={`translate(${margin.left},${margin.top})`}>
        
        {data.cData.map((v,i)=>{
            // 记录此花朵在整个svg中的位置
            data.cData[i].tx = parentPos[0]+margin.left+xScale(v.x)
            data.cData[i].ty = parentPos[1]+margin.top+yScale(v.y)
            let len = v.persons.length
            len = len>3?3:len===2?2:1

          return <g 
            key={`${v.x}-${i}-${v.y}`}
            transform={`translate(${xScale(v.x)-rWidth/2},${yScale(v.y)-rWidth/2})`} >
              <image
                className="reactLeaf_image"
                info={`${index}_${i}_${v.discription}`}
                discription = {v.discription}
                width={rWidth} 
                height={rWidth}
                xlinkHref={v.isChoose?leafSrcChoose[len-1]:leafSrc[len-1]}
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
