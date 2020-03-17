import React from "react";

import btn4 from '../../assets/icon/list.svg';
import btn3 from '../../assets/icon/matrix.svg';
import btn2 from '../../assets/icon/topic.svg';
import btn1 from '../../assets/icon/map.svg';
import btn4_ from '../../assets/list.svg';
import btn3_ from '../../assets/matrix.svg';
import btn2_ from '../../assets/topic.svg';
import btn1_ from '../../assets/map.svg';

const btn_urls = [btn1,btn2,btn3,btn4]
const btn_urls_ = [btn1_,btn2_,btn3_,btn4_]

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