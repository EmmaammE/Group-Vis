import React from "react";

import list from '../../assets/icon/list.svg';
import matrix from '../../assets/icon/matrix.svg';
import topic from '../../assets/icon/topic.svg';
import map from '../../assets/icon/map.svg';
import list_ from '../../assets/list.svg';
import matrix_ from '../../assets/matrix.svg';
import topic_ from '../../assets/topic.svg';
import map_ from '../../assets/map.svg';
// 对应 7\8\9\10图的顺序
const btn_urls = [topic,matrix,map,list]
const btn_urls_ = [topic_,matrix_,map_,list_]

const btnStyle = {
  margin: '0 -5px',
};

const imgStyle = {
  cursor: 'pointer',
}

// 传入active修改图标的样式 active=true表示点击后更新了
function CircleBtn({type, active, onClick}) {

  return (
    <div className="circle-btn" style={btnStyle} onClick={onClick}>
      <img style={imgStyle} src={active?btn_urls[type]:btn_urls_[type]} alt="" />
    </div>
  );
}

export default CircleBtn;