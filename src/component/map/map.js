import React from 'react';
import * as d3 from 'd3';
import song from '../../assets/geojson/song.json';
// import ming from '../../assets/geojson/ming_1391.json';
import { debounce } from '../../util/tools';
import Tip from '../tooltip/Tip'
import { deepClone } from '../../util/tools'
import { setPerson } from '../../actions/data';
import { connect } from 'react-redux';

const BOX_WIDTH = 250;
const BOX_HEIGHT = 170;


let startLoc = [];
let brushFlag = false;
let brushWidth;
let brushHeight;
let brushPersonsId;
let svgWidth, svgHeight;
let svgRatio
let drawData
let prevPropsData

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rScale: d3.scaleLinear()
        .range([6, 12]),
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
        .clamp(true),
      $d: '',
      brushVisibility: "hidden",
      brushTransX: 0,
      brushTransY: 0,
      brushWidth: 0,
      brushHeight: 0,

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


    this.handleBrushMouseDown = this.handleBrushMouseDown.bind(this)
    this.handleBrushMouseMove = this.handleBrushMouseMove.bind(this)
    this.handleBrushMouseUp = this.handleBrushMouseUp.bind(this)

    this.showTooltip = this.showTooltip.bind(this)
    this.showTooltip2 = this.showTooltip2.bind(this)
    this.handleClickX = this.handleClickX.bind(this)
    this.handleMouseOut = this.handleMouseOut.bind(this)

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
    let container = this.$container.current
    // console.log("container",container.clientWidth,container.clientHeight)
    svgWidth = container.clientWidth
    svgHeight = container.clientHeight
    svgRatio = svgWidth / (BOX_WIDTH * 2)
  }

  componentDidUpdate(prevProps) {
    let { pos2sentence, sentence2pos } = this.props;
    if (JSON.stringify(pos2sentence) !== JSON.stringify(prevProps.pos2sentence)) {
      let { rangeScale } = this.state;
      rangeScale.domain(d3.extent(Object.values(pos2sentence).map(e => e.length)))
        .range([5, sentence2pos.length % 20])
      this.setState({
        rangeScale
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

  // 下面三个函数为刷选框的监听函数
  handleBrushMouseDown(v) {
    // console.log("getbox",v.nativeEvent.offsetX,v.nativeEvent.offsetY)
    startLoc = [v.nativeEvent.offsetX / svgRatio, v.nativeEvent.offsetY / svgRatio]
    brushFlag = true
    this.setState({
      brushTransX: startLoc[0],
      brushTransY: startLoc[1],
      brushVisibility: "visible"
    })
  }
  handleBrushMouseMove(v) {
    if (brushFlag) {
      let nowX = v.nativeEvent.offsetX / svgRatio
      let nowY = v.nativeEvent.offsetY / svgRatio
      brushWidth = nowX - startLoc[0]
      brushHeight = nowY - startLoc[1]
      if (brushWidth < 0) {
        nowX = startLoc[0] + brushWidth
        brushWidth = Math.abs(brushWidth)
      } else {
        nowX = startLoc[0]
      }
      if (brushHeight < 0) {
        nowY = startLoc[1] + brushHeight
        brushHeight = Math.abs(brushHeight)
      } else {
        nowY = startLoc[1]
      }
      this.setState({
        brushTransX: nowX,
        brushTransY: nowY,
        brushWidth: brushWidth,
        brushHeight: brushHeight
      })
    }
  }
  handleBrushMouseUp(v) {
    let x1 = this.state.brushTransX
    let y1 = this.state.brushTransY
    let x2 = x1 + this.state.brushWidth
    let y2 = y1 + this.state.brushHeight
    // 拿到尺寸数据反推回去
    // console.log("x-----y",x1,y1,x2,y2)
    // console.log("drawData",drawData)
    let clearAll = true
    let people = {};

    drawData.forEach(d => {
      if (d.xy[0] >= x1 && d.xy[0] <= x2 && d.xy[1] >= y1 && d.xy[1] <= y2) {
        d.isChoose = true
        clearAll = false
      }

      if(d.isChoose === true) {
        d['people'] && d['people'].forEach(p => {
          p.forEach(id => {
            people[id] = true
          })
        })
      }
    })

    if (clearAll) {
      drawData.forEach(d => {
        d.isChoose = false
      })
      people = {}
    }

    // console.log(people)
    this.props.setPerson(people)
    brushFlag = false
    this.setState({
      brushVisibility: "hidden",
      brushTransX: 0,
      brushTransY: 0,
      brushWidth: 0,
      brushHeight: 0
    })
  }

  handleMouseOut() {
    if (!this.state.tooltip.data.tipHasX) {
      this.setState({ tooltip: { show: false } })
    }

  }

  render() {
    let path = this.path,
      projection = this.projection;

    let { addr, sentence2pos, pos2sentence } = this.props;
    let { tooltip, rangeScale, $d } = this.state;

    // console.log("projection",projection,"addr",addr,"sentence2pos",sentence2pos,"pos2sentence",pos2sentence)
    if (prevPropsData != this.props) {
      prevPropsData = this.props
      drawData = figureDrawData(addr, pos2sentence, rangeScale, projection, sentence2pos)
    }
    return (
      <>
        {tooltip.show && <Tip {...tooltip.data} handleClickX={this.handleClickX} />}

        <svg viewBox={`0 0 ${2 * BOX_WIDTH} ${2 * BOX_HEIGHT}`} xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative' }}
          ref={this.$container}
          onMouseDown={this.handleBrushMouseDown}
          onMouseMove={this.handleBrushMouseMove}
          onMouseUp={this.handleBrushMouseUp}
        // preserveAspectRatio="xMinYMin"
        >
          <path d={$d} stroke="white" />
          <g ref={this.$map}>
            {song.features.map((d, i) => (
              <path strokeWidth="1"
                stroke={d.properties.H_SUP_PROV === "Song Dynasty" || d.properties.H_SUP_PROV === null ? '#999' : '#bbb'}
                fill={d.properties.H_SUP_PROV === "Song Dynasty" || d.properties.H_SUP_PROV === null ? '#efefef' : '#fff'}
                d={path(d)}
                key={'fea-' + i}
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
                drawData.map((d, i) => (
                  <circle key={'cir-' + i}
                    index={i}
                    r={d.r}
                    fill={'#a2a4bf'}
                    stroke={d.isChoose ? '#898989' : ''}
                    fillOpacity={0.5}
                    onMouseOver={this.showTooltip}
                    onMouseOut={this.handleMouseOut}
                    onClick={this.showTooltip2}
                    transform={`translate(${d.xy})`} />
                ))
              }
            </g>
          </g>
          {/* 绘制刷选框 */}
          <g
            transform={`translate(${this.state.brushTransX},${this.state.brushTransY})`}
            visibility={this.state.brushVisibility}
          >
            <rect
              className="brush"
              width={this.state.brushWidth}
              height={this.state.brushHeight}
              opacity="0.3"
              strokeWidth="1.5"
              stroke="black"
            >
            </rect>
          </g>
          {/* <text x={80} y={200} fill="#999" fontSize="30px">Song</text> */}
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

function figureDrawData(addr, pos2sentence, rangeScale, projection, sentence2pos) {
  let resultData = [];
  addr && Object.entries(addr).forEach((data, i) => {
    let result = {
      r: 5,
      sentence: [],
      title: '',
      xy: [null, null],
      isChoose: false,
      people: []
    }
    if (pos2sentence[data[0]]) {
      result["r"] = rangeScale(pos2sentence[data[0]].length);
      result["sentence"] = pos2sentence[data[0]].map(d => sentence2pos[d['sentence']]["words"]);
      result["people"] = pos2sentence[data[0]].map(d => d["people"])
    }

    if (data[1]) {
      result["title"] = data[1]['address_name'];
      result['xy'] = projection([data[1]['x_coord'], data[1]['y_coord']]);
      result["isChoose"] = false
    }

    resultData.push(result)
  })

  return resultData;
}