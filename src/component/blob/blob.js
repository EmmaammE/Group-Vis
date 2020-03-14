import React, { useEffect, useState } from 'react';
import * as d3 from 'd3'
import { createBlob } from '../../util/path'
import Axis from './Axis';
import { connect } from 'react-redux';

// the width of svg is 2*BOX_WIDTH
const BOX_WIDTH = 250;
const INNER_RADIUS = 60;
const OUTER_RADIUS = 100;
const SLIDER_HEIGHT = 130;

const defualtStyle = {
  border: "none",
  fill: "url(#gradient)",
  opacity: 0.5,
  strokeDasharray: "none"
}

const rectStyle = {
  fill: "#fff"
}

// TODO 属性值
let fakeData = [
  {name:'item1', value: 30},
  {name:'item2', value: 44},
  {name:'item3', value: 45},
  {name:'item4', value: 48},
  {name:'item5', value: 50},
  {name:'item6', value: 50},
  {name:'item7', value: 50},
  {name:'item8', value: 50},
  {name:'item9', value: 50},
  {name:'item10', value: 55},
  {name:'item11', value: 55},
  {name:'item12', value: 60},
  {name:'item13', value: 70},
  {name:'item14', value: 70},
  {name:'item15', value: 67},
  {name:'item16', value: 70},
  {name:'item17', value: 72},
  {name:'item18', value: 74},
  {name:'item19', value: 78},
  {name:'item20', value: 80},
  {name:'item21', value: 50},
]


function random(min, max) {
  return min + Math.random() * (max - min);
}

const generateCoordinates = (r) => {
  let cors = [];
  let deg = random(0, Math.PI * 2);
  for (let i = 0; i < 3; i++) {
    if (i === 1) {
      deg = deg + Math.PI * 102 / 180;
    } else if (i === 2) {
      deg = deg + Math.PI * 129 / 180;
    }

    let x = BOX_WIDTH + r * Math.sin(deg);
    let y = BOX_WIDTH + r * Math.cos(deg);
    cors.push([x, y]);
  }
  cors.push(cors[0]);
  cors.push(cors[1]);
  cors.push(cors[2]);

  return cors;
}

function Blob({ radius }) {
  const [path, setPath] = useState("");

  useEffect(() => {
    let points = generateCoordinates(radius);
    setPath(createBlob(points));
  }, [radius])

  return <path style={defualtStyle} d={path}></path>
}

class Blobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // TODO get the number of the group
      // blobs: [1000, 500, 200], 
      // TODO 获得blob的层数
      layers: 3,
      // 默认在最高值
      handlePos: 190,
      xScale: d3.scaleBand()
        .range([0, 2 * Math.PI])    
        .align(Math.PI * 5 / 180)                  
        .domain( fakeData.map(function(d) { return d.name; }) ),
      yScale: d3.scaleLinear() 
        .range([0, OUTER_RADIUS - INNER_RADIUS])
        .domain([0,80]),
      rangeScale: d3.scaleLinear()
        .domain([0, 3])
        .range([160 + SLIDER_HEIGHT, 190])
        .clamp(true)
    }

    this.$slider = React.createRef();
    this.$handle = React.createRef();
  }

  componentDidMount() {
    this.initDrag();
  }

  getRadius(r) {
    // TODO get the max value of the group
    let scale = d3.scaleLinear().domain([200, 50000]).range([OUTER_RADIUS+40, BOX_WIDTH-15]);
    return scale(r);
  }

  initDrag() {
    let slider = d3.select(this.$slider.current);
    let that = this;

    let drag = d3.drag()
      .on('start.interrupt', function () {
          console.log('interrupt');
          slider.interrupt();
      }).on('start drag', function () {
          that.dragged(d3.event.y);
      });
    slider.call(drag);
  }

  dragged = (value) => {
    let { rangeScale, layers } = this.state;
    let rangeValues = d3.range(0, layers, 1).concat(layers);

    let y = rangeScale.invert(value), index = null, midPoint, cy;

    // console.log('[invoke dragged]', value, rangeValues, y);
    for (let i = 0; i < rangeValues.length - 1; i++) {
      if (y >= rangeValues[i] && y <= rangeValues[i + 1]) {
        index = i;
        break;
      }
    }
    midPoint = (rangeValues[index] + rangeValues[index + 1]) / 2;
    if (y < midPoint) {
      cy = rangeScale(rangeValues[index]);
    } else {
      cy = rangeScale(rangeValues[index + 1]);
    }

    d3.select(this.$handle.current)
      .transition()
      .duration(500)
      .ease(d3.easeCubicInOut)
      .attr("y", cy)
      .on("end",() =>
        this.setState({
          handlePos: cy
        })
      );
  }

  pathCreator(d) {
    let { xScale, yScale }= this.state;
    return d3.arc()
      .innerRadius(() => INNER_RADIUS + yScale(d.value))
      .outerRadius(INNER_RADIUS + yScale(d.value) + 25)
      .startAngle(function() { return xScale(d.name); })
      .endAngle(function() { return xScale(d.name) + xScale.bandwidth()/3; })
      .padAngle(0.01)
      // .padRadius(INNER_RADIUS)
  }

  render() {
    let { handlePos, rangeScale, layers } = this.state;
    let { blobs } = this.props;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${2 * BOX_WIDTH} ${2 * BOX_WIDTH}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient">
            <stop offset="5%" stopColor="#f35366" />
            <stop offset="95%" stopColor="#f37556" />
          </linearGradient>
        </defs>
        
        {
          blobs.map((r, i) => (
            r !== undefined && <Blob key={`blob-${i}`} radius={this.getRadius(r)} />
          ))
        }

        <g transform={`translate(${BOX_WIDTH},${BOX_WIDTH})`}>
          {
            fakeData.map((data,i) => {
              return <path id={data.name} key={`rect-${i}}`} d={this.pathCreator(data)()} style={rectStyle}></path>
            })
          }
        </g>

        {
          blobs.length>0 && 
          <g className="slider" ref={this.$slider}>
            <rect
              className="slider-overlay"
              x="246" y="185" rx="2" ry="2"
              width="8" height={SLIDER_HEIGHT} fill="#000"
            />
            <rect 
              className="slider-handle"
              ref = {this.$handle}
              x="227.5" y={handlePos} rx="10" ry="10" width="44" height="18" fill="#fff" 
              style = {{cursor:'pointer'}}
            />
            {/* <Axis
              translate="translate(246, 9)"
              scale={rangeScale}
              orient="left"
              ticks = {layers+1}
            />  */}
          </g>
        }
      </svg>
    );
  }
}

// const mapStateToProps = (state) => {
//   return {
//     group_: state.group
//   }
//   connect(mapStateToProps)();
// }

export default Blobs;