import React from 'react';
import * as d3 from 'd3'
import { connect } from 'react-redux';
import * as venn from 'venn.js';

// the width of svg is 2*BOX_WIDTH
const BOX_WIDTH = 250;
const intersect2 = (xs,ys) => xs.filter(x => ys.some(y => y === x));
const intersect = (xs,ys,...rest) => ys === undefined ? xs : intersect(intersect2(xs,ys),...rest);

class Blobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sets: [],
    }

    this.$venn = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if(this.props.vennStep.length!== prevProps.vennStep.length) {
      // if(JSON.stringify(this.props.group) !== JSON.stringify(prevProps.group)) {
        // 更新韦恩图
        let sets = [];
        let {group, vennStep} = this.props;
        
        let people = {};
        let sections = {};
        vennStep.forEach( key => {
          let person_ids = Object.keys(group[key]);
          people[key] = person_ids;
          sets.push({
            sets: [key],
            size: person_ids.length
          })
        })

        for(let j=1;j<=Math.pow(2,vennStep.length)-1;j++) {
          let maskString = j.toString(2);
          let arrs = [];
          for(let k = maskString.length-1; k>=0;k--) {
            if(maskString[k] === '1') {
              arrs.push(vennStep[maskString.length-1 - k])
            }
          }

          if(arrs.length > 1 ) {
            let result = intersect(...arrs.map(key => people[key]));
            sets.push({
              sets: arrs,
              size: result.length
            })
            sections[arrs.join('')] = result;
          }
        }
        
        this.setState({
          sections,
          sets
        })
        this.initVene(sets)
      }
  }

  initVene(sets) {
    d3.select(this.$venn.current).datum(
      sets
    ).call(
      venn.VennDiagram()
        .width(500)
        .height(350)
    )
  }

  render() {

    return (
      <svg height="200px" width="100%" viewBox={`0 0 ${2 * BOX_WIDTH} ${100+ BOX_WIDTH}`} xmlns="http://www.w3.org/2000/svg">
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