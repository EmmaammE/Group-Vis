import React from 'react';
import * as d3 from 'd3';
import song from '../../assets/geojson/song.json';
import {debounce} from '../../util/tools';

const BOX_WIDTH = 250;
const BOX_HEIGHT = 250;

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rScale: d3.scaleLinear()
            .range([6,12]),
    };
    this.projection = d3.geoMercator()
      .center([112, 29])
      .scale(1000)
      .translate([BOX_WIDTH, BOX_HEIGHT]);
    this.path = d3.geoPath()
      .projection(this.projection);

    this.$map = React.createRef();
  }

  componentDidMount() {
    let node = this.$map.current;
    d3.select(node)
      .call(d3.zoom()
              .on("zoom", function(){
                debounce((transform)=>{
                  d3.select(node)
                  .transition()
                  .duration(100)
                  .attr("transform",transform);
                },100)(d3.event.transform)
              }))
  }

  render() {
    let path = this.path;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${2 * BOX_WIDTH} ${2 * BOX_HEIGHT}`} xmlns="http://www.w3.org/2000/svg">
        <g ref={this.$map}>
          {song.features.map((d,i) => (
              <path strokeWidth = "1"
                stroke = {d.properties.H_SUP_PROV==="Song Dynasty"||d.properties.H_SUP_PROV===null?'#999':'#bbb'}
                fill = {d.properties.H_SUP_PROV==="Song Dynasty"||d.properties.H_SUP_PROV===null?'#efefef':'#fff'}
                d={path(d)}
                key={'fea-'+i}
              />
            ))}
        </g>
        <text x={40} y={200} fill="#999" fontSize="30px">Song</text>
      </svg>
    )
  }

}

export default Map;