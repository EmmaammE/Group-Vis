import React from 'react';
import * as d3 from 'd3';
import song from '../../assets/geojson/song.json';
// import ming from '../../assets/geojson/ming_1391.json';
import {debounce} from '../../util/tools';

const BOX_WIDTH = 250;
const BOX_HEIGHT = 213;

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rScale: d3.scaleLinear()
            .range([6,12]),
    };
    this.projection = d3.geoMercator()
      .center([110, 31])
      .scale(860)
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
    let path = this.path,
        projection = this.projection;
    let {addr} = this.props;

    return (
      <svg viewBox={`0 0 ${2 * BOX_WIDTH} ${2 * BOX_HEIGHT}`} xmlns="http://www.w3.org/2000/svg">
        <g ref={this.$map}>
          {song.features.map((d,i) => (
              <path strokeWidth = "1"
                stroke = {d.properties.H_SUP_PROV==="Song Dynasty"||d.properties.H_SUP_PROV===null?'#999':'#bbb'}
                fill = {d.properties.H_SUP_PROV==="Song Dynasty"||d.properties.H_SUP_PROV===null?'#efefef':'#fff'}
                d={path(d)}
                key={'fea-'+i}
              />
            ))}
            {/* {ming.features.map((d,i) => (
              <path strokeWidth = "1"
                stroke = {d.properties["H_PROVINCE"]==="Jingshi"?'#999':'#bbb'}
                fill = {d.properties["H_PROVINCE"]==="Jingshi"?'#efefef':'#fff'}
                d={path(d)}
                key={'fea-'+i}
              />
            ))} */}
            <g>
              {
                addr && 
                Object.values(addr).map((data, i) => {

                  let $circle = data.map((d,j) => (
                    <circle key={'cir-'+i+' '+j} r={5} fill='#a2a4bf' fillOpacity={0.5} stroke='#898989'
                      transform={`translate(${projection([d['x_coord'], d['y_coord']])})`} />
                  ))
                  return $circle;
                })
              }
            </g>
        </g>
        {/* <text x={80} y={200} fill="#999" fontSize="30px">Song</text> */}
      </svg>
    )
  }

}

export default Map;