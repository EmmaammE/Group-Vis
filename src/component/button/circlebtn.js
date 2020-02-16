import React from "react";

const btnStyle = {
  borderRadius: "50%",
  margin: '0 -5px',
};

const imgStyle = {
  display: "inline",
  cursor: 'pointer',
}

function CircleBtn({ onClick, url }) {
  return (
    <div className="circle-btn" style={btnStyle} onClick={onClick}>
      <img style={imgStyle} src={url} alt="" />
    </div>
  );
}

export default CircleBtn;