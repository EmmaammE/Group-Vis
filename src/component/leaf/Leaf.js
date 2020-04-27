import React from "react";

// // 对应 7\8\9\10图的顺序    +|-|清空|filter|删除   生成新的花朵|相似的人|群体对比 (11)
// const btn_urls = [topic,matrix,map,list,add,minus,clear,filter,deleteIcon,flower, similiar, compare]
// const btn_urls_ = [topic_,matrix_,map_,list_,add_,minus_]

// 7,8,9,10


// 传入active修改图标的样式 active=true表示点击后更新了
function Leaf({category, len, isChoose,info,discription}) {
  // console.log("circle",type,active)
  let fillColor,strokeColor
  switch(category){ 
    case 0:
      fillColor = "#B9DDD2"
      strokeColor = "#277077"
      break
    case 1:
      fillColor = "#e4bfb5"
      strokeColor = "#cc7a69"
      break
    case 2:
      fillColor = "#79bbfd"
      strokeColor = "#0e60b3"
      break
    default:
      fillColor = "#B9DDD2"
      strokeColor = "#277077"
  }
  if(isChoose){
    strokeColor = "black"
  }

  const leafInfo = info+`_${discription}`
  return (
    <g id="图层_1-2" >
      <path 
        info={leafInfo}
        discription={discription}
        className="cls-1" 
        // strokeWidth={"0.5px"} 
        fill={fillColor} 
        stroke={strokeColor} 
        opacity={0.7}  
        // strokeMiterlimit={10} 
        d="M.38,3.89a6.8,6.8,0,0,0,3.45,2A11.14,11.14,0,0,1,7.65,8.29a6.77,6.77,0,0,1,1.71,2.64,2.75,2.75,0,0,1,.11,1.46l-.22.72c0,.1-1.06-.59-1.06-.59a11.09,11.09,0,0,0-2.83-1.09s-2.85-1-3.58-2.34A6.82,6.82,0,0,1,.48,6.55,5.47,5.47,0,0,1,.38,3.89Z"/>
      {
        len>0&&<path 
          info={leafInfo}
          discription={discription}
          className="cls-1" 
          fill={fillColor} 
          stroke={strokeColor} 
          opacity={0.7}  
          d="M9.94.45a6.8,6.8,0,0,0,.87,3.92,11.14,11.14,0,0,1,.9,4.39,6.77,6.77,0,0,1-.76,3.05,2.75,2.75,0,0,1-1,1.07l-.67.33C9.19,13.26,9,12,9,12A11.09,11.09,0,0,0,7.85,9.22S6.62,6.46,7.11,5a6.82,6.82,0,0,1,1-2.67A5.47,5.47,0,0,1,9.94.45Z"/>
      }  
      {
        len>1&&<path 
          info={leafInfo}
          discription={discription}
          className="cls-1" 
          fill={fillColor} 
          stroke={strokeColor} 
          opacity={0.7}   
          d="M18.8,4.61A6.8,6.8,0,0,0,16.62,8a11.14,11.14,0,0,1-2.49,3.72,6.77,6.77,0,0,1-2.71,1.6,2.75,2.75,0,0,1-1.46.05l-.71-.25c-.1,0,.63-1,.63-1a11.09,11.09,0,0,0,1.2-2.79s1.1-2.81,2.49-3.49a6.82,6.82,0,0,1,2.57-1.2A5.47,5.47,0,0,1,18.8,4.61Z"/>
      }
    </g>
  );
}

export default Leaf;