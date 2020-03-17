import React from 'react';
import * as d3 from 'd3';
import song from '../../assets/geojson/song.json';
// import ming from '../../assets/geojson/ming_1391.json';
import {debounce} from '../../util/tools';
import Tooltip from '../tooltip/tooltip';

const BOX_WIDTH = 250;
const BOX_HEIGHT = 213;

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rScale: d3.scaleLinear()
            .range([6,12]),
      tooltip: {
        show: false,
        data: {}
      }
    };
    this.projection = d3.geoMercator()
      .center([110, 31])
      .scale(860)
      .translate([BOX_WIDTH, BOX_HEIGHT]);
    this.path = d3.geoPath()
      .projection(this.projection);

    this.$map = React.createRef();
    this.$container = React.createRef();
    this.$tooltip = React.createRef();
    this.showTooltip = this.showTooltip.bind(this);
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
    //   var tool_tip = d3.tip()
    //   .attr("class", "d3-tip")
    //   .offset([-8, 0])
    //   .html(function(d) { return "Radius: " + d; });
    // svg.call(tool_tip);
    // this.$container.call(d3.tip().offset([-8,0]));
  }

  showTooltip(data,coor) {
    console.log(coor);

    this.setState({
      tooltip: {
        show: true,
        data: {
          x: coor[0],
          y: coor[1],
          title: data
        }
      }
    })
  }

  render() {
    let path = this.path,
        projection = this.projection;
    let {addr} = this.props;
    let {tooltip} = this.state;

    return (
      <svg viewBox={`0 0 ${2 * BOX_WIDTH} ${2 * BOX_HEIGHT}`} xmlns="http://www.w3.org/2000/svg"
        style={{position:'relative'}}
        ref = {this.$container}
      >
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
            {tooltip.show && <Tooltip width={2*BOX_WIDTH} height={2*BOX_HEIGHT} {...tooltip.data} />}
            <g>
              {
                addr && 
                Object.entries(addr).map((data, i) => {

                  let $circle = data[1].map((d,j) => (
                    <circle key={'cir-'+i+' '+j} r={5} fill='#a2a4bf' fillOpacity={0.5} stroke='#898989'
                      onMouseOver = {e => this.showTooltip(data[0],projection([d['x_coord'], d['y_coord']]))}
                      onMouseOut = { () => this.setState({tooltip:{show: false}})}
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