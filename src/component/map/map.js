import React from 'react';
import * as d3 from 'd3';
import china from '../../assets/geojson/china.json';
import { debounce } from '../../util/tools';
import Tip from '../tooltip/Tip'
import { deepClone } from '../../util/tools'
import { setPerson } from '../../actions/data';
import { connect } from 'react-redux';
import CircleBtn from '../button/circlebtn';
import mapLogal from '../../assets/icon/mapLogal.svg'

const BOX_WIDTH = 260;
const BOX_HEIGHT = 208;

const path2 = d3.geoPath()
  .projection(d3.geoMercator()
    .center([110, 11])
    .scale(250)
    .translate([465, 365]));

let brush = d3.brush();
class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tooltip: {
        show: false,
        data: {
          tipHasX: false,
          style: {
            "left": 1035,
            "top": 614,
            "visibility": "visible"
          },
          title: '',
          data: ['hhh']
        }
      },
      rangeScale: d3.scaleLinear()
        .range([5, 5]).domain([1, 999])
        .clamp(true),
      $d: '',
    };
    this.projection = d3.geoMercator()
      .center([110, 31])
      .scale(800)
      .translate([BOX_WIDTH, BOX_HEIGHT]);
    this.path = d3.geoPath()
      .projection(this.projection);

    this.$map = React.createRef();
    this.$container = React.createRef();
    this.$tooltip = React.createRef();
    this.showTooltip = this.showTooltip.bind(this);

    this.showTooltip = this.showTooltip.bind(this)
    this.showTooltip2 = this.showTooltip2.bind(this)
    this.handleClickX = this.handleClickX.bind(this)
    this.handleMouseOut = this.handleMouseOut.bind(this)
    this.handleClear = this.handleClear.bind(this)

    this.brushing = this.brushing.bind(this);
    this.brushEnd = this.brushEnd.bind(this);
    this.brushStart = this.brushStart.bind(this);
  }

  componentDidMount() {
    // let node = this.$map.current;
    // d3.select(node)
    //   .call(d3.zoom()
    //           .on("zoom", function(){
    //             debounce((transform)=>{
    //               d3.select(node)
    //               .transition()
    //               .duration(100)
    //               .attr("transform",transform);
    //             },100)(d3.event.transform)
    //           }))

   

    let container = this.$container.current;
    d3.select(container)
      .call(brush
        .on("start", this.brushStart)
        .on("brush", this.brushing)
        .on("end", this.brushEnd));
  }

  componentDidUpdate(prevProps) {
    let { sentence2pos, pos2sentence, addr } = this.props;
    
    if (JSON.stringify(pos2sentence) !== JSON.stringify(prevProps.pos2sentence)) {
      let drawData = figureDrawData(addr, pos2sentence, this.projection, sentence2pos)
    //   let { rangeScale } = this.state;
    //   if(addr) {
    //     let extent = d3.extent(Object.keys(pos2sentence).filter(e => addr[e]).map(e => pos2sentence[e].length))
    //     console.log(extent)
    //     if(extent[0] !== undefined) {
    //       rangeScale.range([5, 12]).domain(extent)
    //     }
    //   }

      this.setState({
        // rangeScale
        drawData
      })
    }
  }

  handleClickX() {
    this.setState({
      tooltip: {
        show: false,
        data: {
          tipHasX: false,
          style: {
            "left": 0,
            "top": 0,
            "visibility": "hidden"
          },
          title: "",
          data: ""
        }
      }
    })
  }

  showTooltip(e) {
    let {drawData} = this.state;
    if (!this.state.tooltip.show) {
      let index = e.target.getAttribute("index")
      this.setState({
        tooltip: {
          show: true,
          data: {
            tipHasX: false,
            style: {
              "left": e.nativeEvent.clientX,
              "top": e.nativeEvent.clientY,
              "visibility": "visible"
            },
            title: drawData[index].title,
            data: drawData[index].sentence
          }
        }
      })
    }
  }

  showTooltip2(e) {
    let {drawData} = this.state;
    let index = e.target.getAttribute("index")
    this.setState({
      tooltip: {
        show: true,
        data: {
          tipHasX: true,
          style: {
            "left": e.nativeEvent.clientX,
            "top": e.nativeEvent.clientY,
            "visibility": "visible"
          },
          title: drawData[index].title,
          data: drawData[index].sentence
        }
      }
    })
  }

  showPoints(sentenceid) {
    let { sentence2pos, addr } = this.props;
    let points = [];
    sentence2pos[sentenceid]["pos"].forEach(pos => {
      points.push(this.projection(
        [addr[pos]['x_coord'], addr[pos]['y_coord']]
      ))
    })

    let d = '';
    points.forEach((point, i) => {
      if (i === 0) {
        d += `M ${point[0]} ${point[1]} `
      } else {
        d += `L ${point[0]} ${point[1]} `
      }
    })
    this.setState({
      $d: d
    })
  }

  brushStart() {
    let {drawData} = this.state;
    if (d3.event.sourceEvent.type === "end") return;
    // 清空之前刷选的
    drawData.forEach(d => { d.isChoose = false});
  }

  brushing() {
    // let { drawData } = this.state;
    // 1if (d3.event.selection) {
    //   const [[x0, y0], [x1, y1]] = d3.event.selection;
    //   drawData.forEach(d => {
    //     d.isChoose =
    //       x0 <= d.xy[0] - d.r && d.xy[0] + d.r < x1 && y0 <= d.xy[1] - d.r && d.xy[1] + d.r < y1;
    //   });

    //   this.setState({
    //     drawData
    //   })
    // }
  }

  brushEnd() {
    if (!d3.event.sourceEvent || d3.event.sourceEvent.type === "end") return;
    d3.select(this.$container.current).call(brush.clear);
    
    let { drawData } = this.state;
    if (d3.event.selection) {
      let people = {};
      const [[x0, y0], [x1, y1]] = d3.event.selection;

      drawData.forEach(d => {
        d.isChoose =
          x0 <= d.xy[0] - d.r && d.xy[0] + d.r < x1 && y0 <= d.xy[1] - d.r && d.xy[1] + d.r < y1;
        if (d.isChoose === true) {
          d['people'] && d['people'].forEach(p => {
            p.forEach(id => {
              people[id] = true
            })
          })
        }
      })

      this.props.setPerson(people)
      this.setState({
        drawData
      })
    }
    
    
  }


  handleMouseOut() {
    if (!this.state.tooltip.data.tipHasX) {
      this.setState({ tooltip: { show: false } })
    }
  }

  handleClear() {
    let { drawData } = this.state;
    drawData.forEach(d => {
      d.isChoose = false
    })
    this.props.setPerson({})
    this.setState({
      drawData
    })
  }

  render() {
    let path = this.path,
      projection = this.projection;

    let { addr, sentence2pos, pos2sentence } = this.props;
    let { tooltip, $d, drawData } = this.state;

    // if (JSON.stringify(prevPropsData) !== JSON.stringify(this.props)) {
    //   prevPropsData = this.props;
      // console.log(drawData)
    // }
    return (
      <>
        {tooltip.show && <Tip {...tooltip.data} handleClickX={this.handleClickX} />}
        <div className="mapView-label-container">
          <div className="mapView-label">
            <svg width="36px" height="16px">
              <image
                className="mapView-label-image"
                width="36"
                height="16"
                xlinkHref={mapLogal}
              />
            </svg>
          </div>
          <p className="mapView-label g-text">#Descriptions</p>
        </div>
        <div className="detail-clear" onClick={this.handleClear}>
          <CircleBtn type={6} active={true} />
        </div>

               <svg viewBox={`0 0 ${2 * BOX_WIDTH} ${2 * BOX_HEIGHT}`} xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative' }}
        // preserveAspectRatio="xMinYMin"
        >
          <clipPath id="myClip">
            <rect x="450" y="300" width="70" height="110" stroke="black" fill="transparent" />
          </clipPath>
          <path d={$d} stroke="white" />
          
          <g ref={this.$map}>
            <g>
              {china.features.map((d, i) => (
                <path strokeWidth="1"
                  stroke="#999"
                  fill="#fff"
                  d={path(d)}
                  key={'fea-' + i}
                />
              ))}
            </g>
            
            <g
            ref={this.$container}
          ></g>
            <g>
              {
                addr &&
                drawData && drawData.map((d, i) => (
                  <circle key={'cir-' + i}
                    index={i}
                    r={d.r}
                    fill="#277077"
                    stroke={d.isChoose ? '#111' : '#277077'}
                    fillOpacity={0.2}
                    onMouseOver={this.showTooltip}
                    onMouseOut={this.handleMouseOut}
                    onClick={this.showTooltip2}
                    transform={`translate(${d.xy})`} />
                ))
              }
            </g>
          </g>
          <rect x="450" y="300" width="70" height="110" stroke="black" fill="transparent" />
          <g clipPath="url(#myClip)">
            {china.features.map((d, i) => (
              <path
                stroke="#999"
                fill="#fff"
                strokeWidth="1"
                d={path2(d)}
                key={'fea-' + i}
              />
            ))}
          </g>
        </svg>
      </>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setPerson: person => dispatch(setPerson(person))
  }
}

export default connect(null, mapDispatchToProps)(Map);

function figureDrawData(addr, pos2sentence, projection, sentence2pos) {
  let resultData = [];

  if (addr && pos2sentence) {
    let rangeScale = d3.scaleLinear()
      .range([5, 12])
      .domain(d3.extent(Object.keys(pos2sentence)
        .filter(e => addr[e])
        .map(e => pos2sentence[e].length)))

    // console.log(rangeScale.domain())
    addr && Object.entries(addr).forEach((data, i) => {
      let result = {
        r: 5,
        sentence: [],
        title: '',
        xy: [0, 0],
        isChoose: false,
        people: []
      }
      if (pos2sentence[data[0]]) {
        if (pos2sentence[data[0]].length > 0) {
          result["r"] = rangeScale(pos2sentence[data[0]].length);
          if (isNaN(result["r"])) {
            result["r"] = 5;
            console.log(data);
          }
          result["sentence"] = pos2sentence[data[0]].map(d => sentence2pos[d['sentence']]["words"]);
          result["people"] = pos2sentence[data[0]].map(d => d["people"])

          if (data[1]) {
            result["title"] = data[1]['address_name'];
            result['xy'] = projection([data[1]['x_coord'], data[1]['y_coord']]);
            result["isChoose"] = false
          }
        }
      }

      resultData.push(result)
    })
  }

  return resultData;
}