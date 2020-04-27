import React from 'react';
import './seqCircles.css' 
import leaf from '../../assets/leaf/leaf.svg'
import leaf_choose from '../../assets/leaf/leaf_choose.svg'
import leaf2 from '../../assets/leaf/leaf2.svg'
import leaf2_choose from '../../assets/leaf/leaf2_choose.svg'
import leaf3 from '../../assets/leaf/leaf3.svg'
import leaf3_choose from '../../assets/leaf/leaf3_choose.svg'

import leaf_a from '../../assets/leaf-a/leaf.svg'
import leaf_choose_a  from '../../assets/leaf-a/leaf_choose.svg'

import leaf_b from '../../assets/leaf-b/leaf.svg'
import leaf_choose_b from '../../assets/leaf-b/leaf_choose.svg'

import Leaf from '../leaf/Leaf.js'

let leafSrc = [leaf,leaf2,leaf3]
let leafSrcChoose = [leaf_choose,leaf2_choose,leaf3_choose]
let leafArr = [
  [leaf,leaf_choose],
  [leaf_a,leaf_choose_a],
  [leaf_b,leaf_choose_b]
]

let leafColor

class SeqCircles extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      highColor:""
    }

    // this.handleMouseover = this.handleMouseover.bind(this)
    // this.handleMouseout = this.handleMouseout.bind(this)
  }

  // handleMouseover(v){
  //   leafColor = v.target.getAttribute("fill")
  //   v.target.setAttribute("fill","red")
  // }

  // handleMouseout(v){
  //   v.target.setAttribute("fill","none")
  // }

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
        {data.map((v,i)=>{
            let category = v.category
            category = category==undefined?0:category
            // let isCh = v.isChoose?1:0
            // let leafResource
            // if(leafArr[category][isCh]){
            //   leafResource = leafArr[category][isCh]
            // }else{
            //   leafResource = leaf
            // }
            let posX = rowOrColumn?xy(v.distance)-rWidth/2:-rWidth/2
            let posY = rowOrColumn?-rWidth/2:xy(v.distance)-rWidth/2

              return  <g
                transform={`translate(${posX},${posY})`}
                key={`timeline_image_${i}`}
                className="timeline_image"
                // onMouseOver={this.handleMouseover}
                // onMouseOut={this.handleMouseout}
              >
                <Leaf
                  category = {category}
                  len = {0}
                  isChoose = {v.isChoose}
                  info = {`${index}_${v.distance}`}
                  discription = {v.discription}
                ></Leaf>
              </g>
              
              // <image
                
              //   x={rowOrColumn?xy(v.distance)-rWidth/2:-rWidth/2}
              //   y={rowOrColumn?-rWidth/2:xy(v.distance)-rWidth/2}
                
              //   fill="none"
              //   info={`${index}_${v.distance}_${v.discription}`}
              //   width={rWidth} 
              //   height={rWidth}
              //   xlinkHref={leafResource}
              // />
              // return <image
              //   key={`timeline_image_${i}`}
              //   className="timeline_image"
              //   x={rowOrColumn?xy(v.distance)-rWidth/2:-rWidth/2}
              //   y={rowOrColumn?-rWidth/2:xy(v.distance)-rWidth/2}
              //   onMouseOver={this.handleMouseover}
              //   onMouseOut={this.handleMouseout}
              //   fill="none"
              //   info={`${index}_${v.distance}_${v.discription}`}
              //   width={rWidth} 
              //   height={rWidth}
              //   xlinkHref={leafResource}
              // />
            
          })
        }
      </g>     
      
    )
  }
}

export default SeqCircles;
