import React from 'react';

import './matrixView.css';
import * as d3 from 'd3';
import MatrixColumn from '../matrixColumn/MatrixColumn'
import LeftLable from '../leftLable/LeftLable'
import { scaleFactory, sortMatrixPerson } from '../util/util'
import { connect } from 'react-redux';
import { updateSelectList } from '../../../redux/selectList.redux'
import Tip from '../../tooltip/Tip'
import { setPerson } from '../../../actions/data'
import MatrixButton from '../../button/MatrixButton'
import CircleBtn from '../../button/circlebtn';
import { deepClone } from '../../../util/tools'

// import 
// 暂时的假数据
let WIDTH = 350;
let HEIGHT = 315;
const START_COLOR = 'red'
const END_COLOR = '#164a73'
const SINGAL_HEIGHT = 25
let labels
let width
let margin = { left: 80, top: 60, right: 30, bottom: 10 }
let sortedData = -1;
let matrixData
let matrixViewState

let startLoc = [];
let brushFlag = false;
let brushWidth;
let brushHeight;
let singleDis;
let brushedPersons = []
let svgWidth, svgHeight;
let svgRatio;

let brush = d3.brush();

class MatrixView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tooltip: "tooltip",
      visibility: "hidden",
      x: "0",
      y: "0",
      targetWidth: 10,
      highRowLabel: -1,
      highColLabel: -1,
      tipHasX: true,
      tipTitle: "count:",
      tipData: [],
      tipStyle: {
        visibility: "hidden"
      },
      // brushVisibility: "hidden",
      // brushTransX: 0,
      // brushTransY: 0,
      // brushWidth: 0,
      // brushHeight: 0,
    }
    this.$container = React.createRef();
    this.handleMouseenter = this.handleMouseenter.bind(this)
    this.handleMouseout = this.handleMouseout.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleClickX = this.handleClickX.bind(this)

    this.handleClear = this.handleClear.bind(this);
    this.handleBrushEnd = this.handleBrushEnd.bind(this);
    this.handleBrushStart = this.handleBrushStart.bind(this);
  }

  componentDidMount() {
    const that = this
    let container = this.$container.current;
              
    d3.select(this.$container.current).call(brush
      .on('start', this.handleBrushStart)
      .on('end', this.handleBrushEnd)
    );

    svgWidth = container.clientWidth
    svgHeight = container.clientHeight
    svgRatio = svgWidth / WIDTH < svgHeight / HEIGHT ? svgWidth / WIDTH : svgHeight / HEIGHT
    // let svg = d3.select(container)
    // svg.on("mousedown", function () {
    //   // if(d3.event.target.localName!="circle"){
    //   // console.log("svg-mousedown",d3.event.offsetX,d3.event.offsetY,d3.event)
    //   startLoc = [d3.event.offsetX / svgRatio, d3.event.offsetY / svgRatio]
    //   brushFlag = true
    //   that.setState({
    //     brushTransX: startLoc[0],
    //     brushTransY: startLoc[1],
    //     brushVisibility: "visible"
    //   })
    //   // }
    // })
    // svg.on("mousemove", function () {
    //   if (brushFlag) {
    //     let nowX = d3.event.offsetX / svgRatio
    //     let nowY = d3.event.offsetY / svgRatio
    //     brushWidth = nowX - startLoc[0]
    //     brushHeight = nowY - startLoc[1]
    //     if (brushWidth < 0) {
    //       nowX = startLoc[0] + brushWidth
    //       brushWidth = Math.abs(brushWidth)
    //     } else {
    //       nowX = startLoc[0]
    //     }
    //     if (brushHeight < 0) {
    //       nowY = startLoc[1] + brushHeight
    //       brushHeight = Math.abs(brushHeight)
    //     } else {
    //       nowY = startLoc[1]
    //     }
    //     that.setState({
    //       brushTransX: nowX,
    //       brushTransY: nowY,
    //       brushWidth: brushWidth,
    //       brushHeight: brushHeight
    //     })
    //   }
    // })
    // svg.on("mouseup", function () {
    //   if (brushFlag) {
    //     startLoc[0] = that.state.brushTransX
    //     startLoc[1] = that.state.brushTransY
    //     brushFlag = false

    //     // 计算筛选的数据
    //     let singleDis = labels.length ? width / labels.length : width

    //     // 依据框选范围判断：是框选人还是放大matrixView，看横坐标比较大那个在哪个位置
    //     if (that.state.brushTransX + that.state.brushWidth < margin.left && that.state.brushWidth > 10 && that.state.brushHeight > singleDis) {
    //       // console.log("矩形刷选人")
    //       // 框选人
    //       filterPerson(that, singleDis)
    //     } else if (that.state.brushWidth > singleDis && that.state.brushHeight > singleDis && that.state.brushTransX + that.state.brushWidth <= WIDTH - margin.right + 5) {
    //       rectFilter(that, singleDis)
    //     } else if ((that.state.brushWidth > 10 || that.state.brushHeight > 10) && that.state.brushTransX > WIDTH - margin.right) {
    //       sortedData = -1
    //     }
    //     // 刷选框消失
    //     that.setState({
    //       brushVisibility: "hidden",
    //       brushWidth: 0,
    //       brushHeight: 0,
    //       brushTransX: 0,
    //       brushTransY: 0
    //     })
    //   }
    // })

  }

  handleBrushStart() {
    if (d3.event.sourceEvent.type === "end") return;
    this.setState({
      tipStyle: {
        visibility: "hidden"
      },
      highRowLabel: -1,
      highColLabel: -1
    })
  }

  handleBrushEnd() {
    if (!d3.event.sourceEvent || d3.event.sourceEvent.type === "end") return;
    d3.select(this.$container.current).call(brush.clear);

    if (d3.event.selection) {
      const [[x0, y0], [x1, y1]] = d3.event.selection;
      console.log(x0, x1, y0, y1)
      // 计算筛选的数据
      let singleDis = labels.length ? width / labels.length : width

      // 依据框选范围判断：是框选人还是放大matrixView，看横坐标比较大那个在哪个位置
      if (x1 < margin.left && x1 - x0 > 10 && y1 - y0 > singleDis) {
        console.log("矩形刷选人")
        // 框选人
        filterPerson(this, singleDis, {x0,x1,y0,y1})
      } else if (x1 - x0 > singleDis && y1 - y0 > singleDis && x1 <= WIDTH - margin.right + 5) {
        rectFilter(this, singleDis)
      } else if ((x1 - x0 > 10 || y1 - y0 > 10) && x0 > WIDTH - margin.right) {
        sortedData = -1
      }
    }
  }

  handleMouseenter(v) {
    if (v.target.localName == "rect") {
      let that = this
      let tipHasX = false
      popUp(that, tipHasX, v)
    }
  }

  handleMouseout(v) {
    if (!this.state.tipHasX) {
      let that = this
      popDown(that)
    }
  }

  handleClick(v) {
    if (v.target.localName == "rect") {
      let that = this
      let tipHasX = true
      popUp(that, tipHasX, v)
    }
  }

  handleClickX() {
    let that = this
    popDown(that)
  }

  handleClear() {
    labels.forEach((d, i) => {
      d.isChoose = false
    })
    this.setState({
      brushVisibility: "hidden",
      brushTransX: 0,
      brushTransY: 0,
      brushWidth: 0,
      brushHeight: 0
    })
    this.props.setPerson({})
    brushedPersons = []
  }

  render() {
    if (sortedData == -1 || matrixViewState != this.props.matrixView) {
      matrixViewState = this.props.matrixView
      // console.log("matrixViewState",matrixViewState)
      sortedData = sortMatrixPerson(deepClone(this.props.matrixView))
    }



    // console.log("sortedData--matrixView",sortedData)
    matrixData = sortedData.matrixData
    labels = sortedData.matrixPerson
    // xy是比例尺，因为是方型所以，横竖方向使用一个
    // colorMap是颜色比例尺

    width = WIDTH - margin.left - margin.right

    const { maxValue, xy, colorMap } = scaleFactory(width, matrixData, START_COLOR, END_COLOR)
    let tipX = margin.left + xy(this.state.highRowLabel) + this.state.targetWidth
    let tipY = margin.top + xy(this.state.highColLabel)
    tipX = tipX ? tipX : 0;
    tipY = tipY ? tipY : 0;

    console.log(matrixData)
    return (
      <div className="chart-wrapper">
        <div className="header-line">
          <div className="g-chart-title">Interpersonal Events</div>
          {labels.length == 0 ? null :
            <div className="matrix-label-container g-text">
              <div className="matrix-label-event">#Events</div>
              <div className="matrix-label">
                <div className="matrix-left-num">0</div>
                <div className="middle-rectangle"></div>
                <div className="matrix-left-num">{maxValue}</div>
              </div>
            </div>
          }

          <div className="detail-clear" onClick={this.handleClear}>
            <CircleBtn type={6} active={true} />
          </div>
        </div>
        {
          <Tip
            tipHasX={this.state.tipHasX}
            data={this.state.tipData}
            title={this.state.tipTitle}
            style={this.state.tipStyle}
            handleClickX={this.handleClickX}
          >
          </Tip>
        }
        <div className="matrix-container">
          {

            <svg
              // width={WIDTH} 
              // height={HEIGHT} 
              width="100%"
              height="100%"
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              preserveAspectRatio="xMinYMin"
            >
              <g ref={this.$container}>

              {labels.length == 0
                ? <text
                  transform={`translate(15,15)`}
                  fontSize="15px">{"No Concerned People"}</text>
                : <g transform="translate(0,0)">
                  {/* 绘制坐标轴 */}
                  {
                    labels.length > 25
                      ? null
                      : <g className="matrix_lables"  >
                        <g transform={`translate(${margin.left},${margin.top})`} >
                          <LeftLable
                            key={`lable_row`}
                            rowOrColumn={true}
                            data={labels}
                            xy={xy}
                            rotate={-45}
                            highLable={this.state.highRowLabel}
                          ></LeftLable>
                        </g>
                        <g transform={`translate(${margin.left * 0.95},${margin.top})`}>
                          <LeftLable
                            key={`lable_column`}
                            rowOrColumn={false}
                            data={labels}
                            xy={xy}
                            rotate={0}
                            highLable={this.state.highColLabel}
                          ></LeftLable>
                        </g>
                      </g>
                  }
                  {/* <g className='brush-overlay' ref={this.$container}>
                  </g> */}
                  {/* 绘制矩形块 */}
                  <g
                    className="matrix_columns"
                    transform={`translate(${margin.left},${margin.top})`}
                    onMouseEnter={this.handleMouseenter}
                    onMouseOut={this.handleMouseout}
                    onClick={this.handleClick}
                  >
                    {
                      matrixData.map((v, i) => (
                        <MatrixColumn data={v} index={i} xy={xy} colorMap={colorMap} key={i} />
                      ))
                    }
                  </g >
                </g>
              }
              </g>
              {/* 绘制动态刷选框 */}
              {/* <g className="matrix-dynamic-brush">
                <rect
                  transform={`translate(${this.state.brushTransX},${this.state.brushTransY})`}
                  visibility={this.state.brushVisibility}
                  className="brush"
                  width={this.state.brushWidth}
                  height={this.state.brushHeight}
                  opacity="0.4"
                  strokeWidth="1.5"
                  stroke="black"
                  fill="#eeeeee"
                >
                </rect>
              </g> */}
            </svg>
          }

        </div>
        {/* <VerticalSlider></VerticalSlider> */}
      </div>

    )
  }
}

const mapStateToProps = (state) => ({
  matrixView: state.matrixView,
  peopleToList: state.peopleToList
})
const mapDispatchToProps = {
  updateSelectList,
  setPerson
}

export default connect(mapStateToProps, mapDispatchToProps)(MatrixView);


function popUp(that, tipHasX, v) {

  let infos = v.target.getAttribute("info").split("_").map(v => Number(v))
  let name = []
  name.push(labels[infos[0]].name)
  name.push(labels[infos[1]].name)
  that.setState({
    highRowLabel: infos[0],
    highColLabel: infos[1]
  })
  let joinName = name.sort((a, b) => {
    return b.localeCompare(a)
  }).join('-')
  // console.log("")
  // 如果那两个人有共同的交集的话：
  if (that.props.peopleToList[joinName] != undefined) {
    let selectListData = that.props.peopleToList[joinName]
    let tipStyle = {
      left: v.clientX,
      top: v.clientY,
      visibility: "visible"
    }
    that.setState({
      tipData: selectListData,
      tipTitle: `count:${selectListData.length}`,
      tipStyle: tipStyle,
      tipHasX: tipHasX
    })
  } else {
    // 该两人没有交集
    let tipStyle = {
      left: v.clientX,
      top: v.clientY,
      visibility: "visible"
    }
    that.setState({
      tipData: ["none"],
      tipTitle: `count:0`,
      tipStyle: tipStyle,
      tipHasX: tipHasX
    })
  }
}

function popDown(that) {
  let tipStyle = {
    visibility: "hidden"
  }
  that.setState({
    tipStyle: tipStyle,
    highRowLabel: -1,
    highColLabel: -1
  })
}

function rectFilter(that, singleDis) {
  return new Promise((resolve) => {
    let startX = figureXY(that.state.brushTransX, singleDis, margin.left, true)
    let endX = figureXY(that.state.brushTransX + that.state.brushWidth, singleDis, margin.left, false) + 1
    let startY = figureXY(that.state.brushTransY, singleDis, margin.top, true)
    let endY = figureXY(that.state.brushTransY + that.state.brushHeight, singleDis, margin.top, false) + 1
    // 取并集
    let startIndex = startX < startY ? startX : startY
    let endIndex = endX > endY ? endX : endY
    // console.log("startIndex",startIndex,endIndex)
    if (startIndex == endIndex) {
      sortedData = -1
      resolve()
    } else {
      sortedData.matrixPerson = labels.slice(startIndex, endIndex)
      sortedData.matrixData = matrixData.slice(startIndex, endIndex)
      sortedData.matrixData = sortedData.matrixData.map(v => v.slice(startIndex, endIndex))
      // console.log("sortedData",sortedData)
      resolve()
    }
  })


}

function filterPerson(that, singleDis, coors) {
  let startIndex = figureXY(coors.y0, singleDis, margin.top, true)
  let endIndex = figureXY(coors.y1, singleDis, margin.top, false)
  // 取并集
  console.log("filterPerson", singleDis, startIndex, endIndex)

  if (startIndex <= endIndex) {
    let brushPersonsId = []
    for (let i = startIndex; i <= endIndex; i++) {
      if (sortedData.matrixPerson[i]) {
        sortedData.matrixPerson[i].isChoose = true
        brushPersonsId.push(sortedData.matrixPerson[i].id)
      }
    }
    // 合并去重
    brushedPersons = [...brushedPersons, ...brushPersonsId]
    brushedPersons = [...new Set(brushedPersons)]
    console.log("brushedPersons", brushedPersons)
    let personsIdObject = [...brushedPersons]
      .reduce((acc, e) => ({ ...acc, [e]: true }), {})
    that.props.setPerson(personsIdObject)
  }
}

function figureXY(brushDis, singleDis, margin, flag) {
  // console.log("figureXY",brushDis,singleDis,margin)
  let result
  if (brushDis <= margin) {
    result = 0
  } else {
    let tempDis = brushDis - margin
    result = Math.floor(tempDis / singleDis)
    // 如果过半
    if (tempDis - result * singleDis >= singleDis * 0.5) {
      result = result + (flag ? 1 : 0)
    } else {
      result = result + (flag ? 0 : -1)
    }
  }
  result = result < 0 ? 0 : result
  // console.log("result",result)
  return result

}