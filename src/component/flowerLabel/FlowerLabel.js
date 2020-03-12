import React from 'react';
import flower from '../../assets/huaban1.svg';


const imgStyle = {
  display: "inline",
  cursor: 'pointer',
}

class FlowerLabel extends React.Component{
  constructor(props){
    super(props);
    this.state={
      
    }
  }

  render(){
    return (
      // <div>
      //   <img style={imgStyle} width="20" height="30" src={flower} alt=""/>
      // </div>
      <g>
        <svg width="20px" height="19px" viewBox="0 0 20 19" version="1.1" xmlns="http://www.w3.org/2000/svg" >
          <defs>
            <linearGradient
              id="flowerLinearColor"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#f8deeb"></stop>
              <stop offset="100%" stopColor="#fa4289"></stop>
            </linearGradient>
          </defs>
          <g id="Page-1" stroke="none" strokeWidth="1" fill={`url(#flowerLinearColor)`} fillRule="evenodd">
              <g id="Desktop-HD" transform="translate(-10439.000000, -638.000000)" stroke="#979797" strokeWidth="0.3">
                  <path d="M10440,643.374484 C10440,644.78215 10442.6158,648.355291 10444.3679,650.29026 C10446.1199,652.225228 10447.9113,653.702036 10450.0738,654.642848 C10452.2362,655.58366 10456.7222,656.474275 10457.3828,656.474275 C10457.7,656.474275 10457.8695,656.41723 10457.8695,656.095551 C10457.8695,656.095551 10456.6378,650.562101 10455.4048,648.085021 C10453.9674,645.197386 10452.0109,643.733686 10451.1403,643.013213 C10450.2698,642.29274 10446.5378,639.408659 10444.7018,639.040155 C10442.8658,638.671652 10440.914,640.960727 10440.914,640.960727 C10440.914,640.960727 10440,641.966817 10440,643.374484 Z" id="Path-25"></path>
              </g>
          </g>
        </svg>
      </g>
    )
  }
}
export default FlowerLabel;