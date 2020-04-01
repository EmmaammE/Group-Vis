import React from 'react';
import * as d3 from 'd3'
import { connect } from 'react-redux';
import * as venn from 'venn.js';
import { createMask } from '../../util/tools';

// the width of svg is 2*BOX_WIDTH
const BOX_WIDTH = 250;

class Blobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sets: [],
    }

    this.$venn = React.createRef();
  }

  componentDidUpdate(prevProps) {
    try{
      if(this.props.vennStep.length!== prevProps.vennStep.length) {
        // if(JSON.stringify(this.props.group) !== JSON.stringify(prevProps.group)) {
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
          this.props.vennStep.forEach((key, keyIndex)=> {
            let person_ids = Object.keys(group[key]);
            sets.push({
              sets: [key],
              size: person_ids.length
            })
    
            // eslint-disable-next-line 
            person_ids.forEach(id => {
              if(count[id] === undefined) {
                count[id] = new Array(boolSize).fill(false);
              }
              count[id][keyIndex] = true;
            })
    
          })
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
              if(maskString[i] === '1') {
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
    }catch{

    }
  }

  initVene(sets) {
    d3.select(this.$venn.current).datum(
      sets
    ).call(
      venn.VennDiagram()
        .width(500)
        .height(500)
    )
  }

  render() {

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
    group: _group,
    vennStep: state.vennstep
  }
}

export default connect(mapStateToProps)(Blobs);