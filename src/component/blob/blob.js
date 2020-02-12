import React, { useEffect, useState } from 'react';
import * as d3 from 'd3'
import { createBlob } from '../../util/path'

// the width of svg is 2*BOX_WIDTH
const BOX_WIDTH = 250;
const INNER_RADIUS = 60;
const OUTER_RADIUS = 100;

const defualtStyle = {
  border: "none",
  fill: "url(#gradient)",
  opacity: 0.7,
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
      blobs: [800, 500, 200],
      xScale: d3.scaleBand()
        .range([0, 2 * Math.PI])    
        .align(Math.PI * 5 / 180)                  
        .domain( fakeData.map(function(d) { return d.name; }) ),
      yScale: d3.scaleLinear() 
        .range([0, OUTER_RADIUS - INNER_RADIUS])
        .domain([0,80])
    }
  }

  getRadius(r) {
    // TODO get the max value of the group
    let scale = d3.scaleLinear().domain([0, 1000]).range([OUTER_RADIUS+30, BOX_WIDTH]);
    return scale(r);
  }

  initScale() {
    let xScale = d3.scaleBand()
      .range([0, 2 * Math.PI])    
      .align(Math.PI * 5 / 180)                  
      .domain( fakeData.map(function(d) { return d.name; }) );

    let yScale = d3.scaleOrdinal() 
      .range([INNER_RADIUS, OUTER_RADIUS])
      .domain([0,50])

    this.setState({
      xScale, yScale
    })
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
    let { blobs } = this.state;
    // console.log(this.state.xScale())
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${2 * BOX_WIDTH} ${2 * BOX_WIDTH}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient">
            <stop offset="5%" stopColor="#f7717a" />
            <stop offset="95%" stopColor="#f88470" />
          </linearGradient>
        </defs>
        
        {
          blobs.map((r, i) => (
            <Blob key={`blob-${i}`} radius={this.getRadius(r)} />
          ))
        }

        <g transform={`translate(${BOX_WIDTH},${BOX_WIDTH})`}>
          <circle r={10} fill="#f00"></circle>
          <g transform={`translate(-5,-40)`}>
            <rect style={{borderRadius:'10px'}} width="10" height="80" fill="#000"></rect>
          </g>
          {
            fakeData.map((data,i) => {
              return <path id={data.name} key={`rect-${i}}`} d={this.pathCreator(data)()} style={rectStyle}></path>
            })
          }
        </g>
      </svg>
    );
  }
}

export default Blobs;