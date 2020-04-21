import React from 'react';
import * as d3 from 'd3';
import song from '../../assets/geojson/song.json';
// import ming from '../../assets/geojson/ming_1391.json';
import {debounce} from '../../util/tools';
import Tip from '../tooltip/Tip'

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
        data: {
          style: {
            "left":1035,
            "top":614,
            "visibility": "visible"
          },
          title: '',
          data: ['hhh']
        }
      },
      rangeScale: d3.scaleLinear()
          .clamp(true),
      $d: ''
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
  }

  componentDidUpdate(prevProps) {
    let {pos2sentence, sentence2pos} = this.props;
    if(JSON.stringify(pos2sentence) !== JSON.stringify(prevProps.pos2sentence)) {
      let {rangeScale} = this.state;
      rangeScale.domain(d3.extent(Object.values(pos2sentence).map(e=>e.length)))
        .range([5, sentence2pos.length % 20])
      this.setState({
        rangeScale
      })
    }
  }

  showTooltip(data,coor) {
    console.log(coor);

    this.setState({
      tooltip: {
        show: true,
        data: {
          style: {
            "left":coor[0],
            "top": coor[1],
            "visibility": "visible"
          },
          title: data['title'],
          data: data['sentence']
        }
      }
    })
  }

  showPoints(sentenceid) {
    let {sentence2pos, addr} = this.props;
    let points = [];
    sentence2pos[sentenceid]["pos"].forEach(pos => {
      points.push(this.projection(
        [addr[pos]['x_coord'], addr[pos]['y_coord']]
      ))
    })

    let d = '';
    points.forEach((point, i) => {
      if(i === 0) {
        d += `M ${point[0]} ${point[1]} `
      } else {
        d += `L ${point[0]} ${point[1]} `
      }
    })
    this.setState({
      $d: d
    })
  }

  render() {
    let path = this.path,
        projection = this.projection;
    let {addr, sentence2pos, pos2sentence} = this.props;
    let {tooltip, rangeScale, $d} = this.state;

    return (
      <>
       {tooltip.show && <Tip {...tooltip.data} /> }

       <svg viewBox={`0 0 ${2 * BOX_WIDTH} ${2 * BOX_HEIGHT}`} xmlns="http://www.w3.org/2000/svg"
        style={{position:'relative'}}
        ref = {this.$container}
      >
        <path d={$d} stroke="white" />
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
                Object.entries(addr).map((data, i) => {
                  let _r;
                  if(pos2sentence[data[0]]) {
                    _r = rangeScale( pos2sentence[data[0]].length )
                  } else {
                    _r  = 5;
                  }
                  if(data[1]) {
                    let d = data[1]
                    return (
                      <circle key={'cir-'+i} 
                        r={_r}
                        fill='#a2a4bf' fillOpacity={0.5} stroke='#898989'
                        onMouseOver = {e => this.showTooltip({
                          'sentence': pos2sentence[data[0]].map( d => sentence2pos[d['sentence']]["words"]),
                          'title': d['address_name']
                        }, [e.nativeEvent.clientX, e.nativeEvent.clientY])}
                        // projection(e, d['y_coord']]))}
                        onMouseOut = { () => this.setState({tooltip:{show: false}})}
                        transform={`translate(${projection([d['x_coord'], d['y_coord']])})`} />
                    )
                  } else {
                    return null
                  }
                })
              }
            </g>
        </g>
        {/* <text x={80} y={200} fill="#999" fontSize="30px">Song</text> */}
      </svg>
      </>

    )
  }
}

export default Map;