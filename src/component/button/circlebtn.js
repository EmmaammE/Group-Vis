import React from "react";

import list from '../../assets/icon/list.svg';
import matrix from '../../assets/icon/matrix.svg';
import timeline from '../../assets/icon/timeline.svg';
import map from '../../assets/icon/map.svg';
import list_ from '../../assets/list.svg';
import matrix_ from '../../assets/matrix.svg';
import topic_ from '../../assets/icon/map.svg';
import map_ from '../../assets/map.svg';
import add from '../../assets/brush/add.svg';
import minus from '../../assets/brush/minus.svg'
import add_ from '../../assets/brush/add_choose.svg'
import minus_ from '../../assets/brush/minus_choose.svg'
import clear from '../../assets/brush/clear.svg'
import filter from '../../assets/brush/filter.svg'
import deleteIcon from '../../assets/deleteIcon.svg'

import flower from '../../assets/icon/flower.svg'
import similiar from '../../assets/icon/similiar.svg'
import compare from '../../assets/icon/compare.svg'
import download from '../../assets/icon/download.png'

// 对应 7\8\9\10图的顺序                  +|-|清空|clear|删除   生成新的花朵|相似的人|群体对比 (10)
const btn_urls = [timeline,matrix,map,list,add,minus,clear,deleteIcon,flower, similiar, compare, download]
const btn_urls_ = [timeline,matrix,map,list,add_,minus_]

const titles = ['加选','减选', '清除框选', '删除主题', '生成新的群体', '查询相似的人', '下载CSV']
// 7,8,9,10
const imgStyle = {
  cursor: 'pointer',
}

// 传入active修改图标的样式 active=true表示点击后更新了
function CircleBtn({type, active, onClick}) {
  // console.log("circle",type,active)
  return (
    <div className="circle-btn" onClick={onClick} title={type >= 4 && titles[type-4]}>
      <img style={imgStyle} 
        src={active?btn_urls[type]:btn_urls_[type]} alt="" />
    </div>
  );
}

export default CircleBtn;