import React from "react";

import list from '../../assets/icon/list.svg';
import matrix from '../../assets/icon/matrix.svg';
import topic from '../../assets/icon/topic.svg';
import map from '../../assets/icon/map.svg';
import list_ from '../../assets/list.svg';
import matrix_ from '../../assets/matrix.svg';
import topic_ from '../../assets/topic.svg';
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

// 对应 7\8\9\10图的顺序    +|-|清空|filter|删除   生成新的花朵|相似的人|群体对比 (11)
const btn_urls = [topic,matrix,map,list,add,minus,clear,filter,deleteIcon,flower, similiar, compare]
const btn_urls_ = [topic_,matrix_,map_,list_,add_,minus_]

const btnStyle = { 
  margin: '0 -6px',
};

const imgStyle = {
  cursor: 'pointer',
  transform:"scale(0.9)"
}

// 传入active修改图标的样式 active=true表示点击后更新了
function CircleBtn({type, active, onClick}) {
  // console.log("circle",type,active)
  return (
    <div className="circle-btn" style={btnStyle} onClick={onClick}>
      <img style={imgStyle} src={active?btn_urls[type]:btn_urls_[type]} alt="" />
    </div>
  );
}

export default CircleBtn;