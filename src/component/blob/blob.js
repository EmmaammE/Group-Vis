import React, { useEffect, useState } from 'react';
import * as d3 from 'd3'
import { createBlob } from '../../util/path'
import Axis from './Axis';
import { connect } from 'react-redux';
import * as venn from 'venn.js';
import { setCountedLayer } from '../../actions/data';
import { createMask } from '../../util/tools';

// the width of svg is 2*BOX_WIDTH
const BOX_WIDTH = 250;
const INNER_RADIUS = 60;
const OUTER_RADIUS = 100;
const SLIDER_HEIGHT = 130;

class Blobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sets: [],
      // TODO get the number of the group
      // blobs: [1000, 500, 200], 
      // TODO 获得blob的层数
      layers: props.layer,
      // 默认在最高值
      handlePos: 190,
      yScale: d3.scaleLinear() 
        .range([0, OUTER_RADIUS - INNER_RADIUS])
        .domain([0,80]),
      rangeScale: d3.scaleLinear()
        .domain([0, props.layer])
        .range([160 + SLIDER_HEIGHT, 190])
        .clamp(true)
    }

    this.$slider = React.createRef();
    this.$venn = React.createRef();
    this.$handle = React.createRef();
  }

  componentDidMount() {
    this.initDrag();
  }

  componentDidUpdate(prevProps) {
    if(this.props.layer !== prevProps.layer) {
      // 更新layer
      let {rangeScale} = this.state;
      rangeScale.domain([0, this.props.layer]);

      
      this.setState({
        rangeScale,
        layers: this.props.layer
      })

      this.initDrag();
    }

    if(JSON.stringify(this.props.group) !== JSON.stringify(prevProps.group)) {
      // 更新韦恩图
      let sets = [];
      let {group} = this.props;

      // TODO 暂时只考虑32步以内
      let groupKeys = Object.keys(group);
      // 掩码数组的长度: 每一位对应Object.keys()得到的person_id数组集合是否包含该元素， 包含则为true
      let boolSize = groupKeys.length;
      // 映射每一个person_id的掩码数组的状态
      let count = {};
      // 每个key对应掩码数组的下标
      let keyIndex = 0;
      for(let key in group) {
        let person_ids = Object.keys(group[key]);
        if(key!=='1') {
          sets.push({
            sets: [key],
            size: person_ids.length
          })
        }

        // eslint-disable-next-line 
        person_ids.forEach(id => {
          if(count[id] === undefined) {
            count[id] = new Array(boolSize).fill(false);
          }
          count[id][keyIndex] = true;
        })

        keyIndex++;
      }

       // 各元素掩码的集合 - mask: 元素的个数 
      let maskCount = {}
      for(let id in count) {
        let mask = createMask(...count[id]);
        if(maskCount[mask] === undefined) {
          maskCount[mask] = 0;
        }
        maskCount[mask]++;
      }

      for(let mask in maskCount) {
        let maskString = Number(mask).toString(2);
        let _sets = [];
        for(let i=maskString.length-1; i>=0; i--) {
          if(maskString[i] === '1' && groupKeys[i]!=='1') {
            _sets.push(groupKeys[i]);
          }
        }
        if(_sets.length>1) {
          sets.push({
            sets: _sets,
            size: maskCount[mask]
          })
        }
      }
      
      sets.forEach(e => {
        e.size = Math.sqrt(e.size)
      })
      // let result = data.reduce((a, b) => a.filter(c => b.includes(c)));
      this.setState({
        sets
      })
      this.initVene(sets)
    }
  }

  initVene(sets) {
    try{
      d3.select(this.$venn.current).datum(
        sets
      ).call(
        venn.VennDiagram()
          .width(500)
          .height(500)
      )
    }catch{
      console.log(sets);
    }
   
  }

  getRadius(r) {
    // TODO get the max value of the group
    let scale = d3.scaleLinear().domain([200, 2000]).range([OUTER_RADIUS+40, BOX_WIDTH-15]);
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
      .on("end",() => {
        this.props.setCountedLayer(index);
        this.setState({
          handlePos: cy
        })
      });
  }

  render() {
    let { handlePos,rangeScale,sets} = this.state;
    let { layer } = this.props;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${2 * BOX_WIDTH} ${2 * BOX_WIDTH}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient">
            <stop offset="5%" stopColor="#f35366" />
            <stop offset="95%" stopColor="#f37556" />
          </linearGradient>
        </defs>

        <foreignObject x="0" y="0" width="500" height="500" ref={this.$venn}>
        </foreignObject>
        
        {
          sets.length>0 && 
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
            <Axis
              translate="translate(246, 9)"
              scale={rangeScale}
              orient="left"
              ticks = {layer+1}
            /> 
          </g>
        }
      </svg>
    );
  }
}

const mapStateToProps = (state) => {
  let _group = {};
  for(let key in state.group) {
    _group[key] = state.group[key]['people']
  }
  return {
    layer: state.step,
    group: _group
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setCountedLayer: layer => dispatch(setCountedLayer(layer))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Blobs);