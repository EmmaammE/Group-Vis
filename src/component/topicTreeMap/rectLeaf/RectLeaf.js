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

import leaf_a from '../../../assets/leaf-a/leaf.svg'
import leaf_choose_a  from '../../../assets/leaf-a/leaf_choose.svg'
import leaf2_a  from '../../../assets/leaf-a/leaf2.svg'
import leaf2_choose_a  from '../../../assets/leaf-a/leaf2_choose.svg'
import leaf3_a  from '../../../assets/leaf-a/leaf3.svg'
import leaf3_choose_a  from '../../../assets/leaf-a/leaf3_choose.svg'

import leaf_b from '../../../assets/leaf-b/leaf.svg'
import leaf_choose_b from '../../../assets/leaf-b/leaf_choose.svg'
import leaf2_b from '../../../assets/leaf-b/leaf2.svg'
import leaf2_choose_b from '../../../assets/leaf-b/leaf2_choose.svg'
import leaf3_b from '../../../assets/leaf-b/leaf3.svg'
import leaf3_choose_b from '../../../assets/leaf-b/leaf3_choose.svg'

import Leaf from '../../leaf/Leaf'

import '../topicTreeMap.css'
const margin = {top:25,bottom:8,left:8,right:8}

let leafSrc = [leaf,leaf2,leaf3]
let leafSrcChoose = [leaf_choose,leaf2_choose,leaf3_choose]
let leafArr = [
  [[leaf,leaf2,leaf3],[leaf_choose,leaf2_choose,leaf3_choose]],
  [[leaf_a,leaf2_a,leaf3_a],[leaf_choose_a,leaf2_choose_a,leaf3_choose_a]],
  [[leaf_b,leaf2_b,leaf3_b],[leaf_choose_b,leaf2_choose_b,leaf3_choose_b]]
]


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
    let labelStr = data.label.split("")
    let singleWordWidth
    // 说明改名字是英文
    if((labelStr[0]>='a'&&labelStr[0]<='z')||(labelStr[0]>='A'&&labelStr[0]<='Z')){
      singleWordWidth = 6
    }else{
      singleWordWidth = 13
    }
    let labelLength = labelStr.length
    // 算出该标题全部展开占横向距离多大，一个字符长度大概是13px
    let pxLength = labelLength * singleWordWidth
    // 算出margin.top需要多少，一行占高度是16
    margin.top = Math.ceil(pxLength/width)*16+5
    // 使用差值动画的话，开始width会非常的小,可能会溢出变负
    if(margin.top<0) return null
    
    let height = this.props.height-margin.top-margin.bottom
    while(height<=0&&margin.top>16){
      margin.top = margin.top-16
      height = this.props.height-margin.top-margin.bottom
    }
    if(height<=0)return null
    let compareFlag = false
    let pHeight,transHeight
    if(data.personRatio===-1){
      compareFlag = true
      pHeight = []
      transHeight = []
      let tempH = Number((data.abRatio[0]*this.props.height).toFixed(0))
      pHeight.push(tempH)
      transHeight.push(this.props.height-tempH)
      tempH = Number((data.abRatio[1]*this.props.height).toFixed(0))
      pHeight.push(tempH)
      transHeight.push(this.props.height-tempH)
    }else{
      pHeight = Number((data.personRatio*this.props.height).toFixed(0))
      transHeight = this.props.height-pHeight
    }
   
    const {xScale,yScale} = rectLeafScale(data.cData,width,height)
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
      {
        compareFlag?
        <g>
          <rect
            transform={`translate(0,${transHeight[0]})`}
            fill="#f0dbd6"
            opacity="0.5"
            width = {this.props.width/2}
            height= {pHeight[0]}  
            index={index} 
          >
          </rect>
          <rect
            transform={`translate(${this.props.width/2},${transHeight[1]})`}
            fill="#164a73"
            opacity="0.2"
            width = {this.props.width/2}
            height= {pHeight[1]}  
            index={index} 
          >
          </rect>
        </g>
        :<rect
          transform={`translate(0,${transHeight})`}
          fill="#f0dbd6"
          opacity="0.5"
          width = {this.props.width}
          height= {pHeight}  
          index={index} 
        >
        </rect>
      }
      <rect
        stroke="#c36958"
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
            let category = v.category
            let isCh = v.isChoose?1:0
            let len = v.persons.length
            
            len = len>3?3:len===2?2:1
            len--
            let leafResource
            if(leafArr[category][isCh][len]){
              leafResource = leafArr[category][isCh][len]
            }else{
              leafResource = leaf
            }
          return <g 
            key={`${v.x}-${i}-${v.y}`}
            transform={`translate(${xScale(v.x)-rWidth/2},${yScale(v.y)-rWidth/2})`} >
              <g
                className="reactLeaf_image"
                info={`${index}_${i}_${v.discription}`}
                discription = {v.discription}
                fill="none"
                // r={rWidth} 
              >
                <Leaf category= {category} len={len} isChoose={v.isChoose} info={`${index}_${i}`} discription={v.discription} ></Leaf>
              </g>
              {/* <image
                className="reactLeaf_image"
                info={`${index}_${i}_${v.discription}`}
                discription = {v.discription}
                width={rWidth} 
                height={rWidth}
                xlinkHref={leafResource}
              /> */}
          </g> 
        })
        }
      </g>     
    </g>
    )
  }
}

export default RectLeaf;
