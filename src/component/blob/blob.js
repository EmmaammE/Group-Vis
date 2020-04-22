import React from 'react';
import * as d3 from 'd3'
import { connect } from 'react-redux';
import * as venn from 'venn.js';
import { fetchTopicData } from '../../actions/step';

const intersect2 = (xs,ys) => xs.filter(x => ys.some(y => y === x));
const intersect = (xs,ys,...rest) => ys === undefined ? xs : intersect(intersect2(xs,ys),...rest);

class Blobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // 保存各种类型集合的值，key: stepArr.sort().join('-')
      sets: {},
      rects: {
        x: 0,
        y: 0,
      },
    }

    this.$venn = React.createRef();
    this.$rect = React.createRef();
  }

  componentDidMount() {
    this.updateVenn();
  }

  componentDidUpdate(prevProps) {
    if(this.props.vennStep.length!== prevProps.vennStep.length) {
      this.updateVenn()
    }
  }

  listenClick() {
    let that = this;
    let root = this.$venn.current.querySelector('svg');
    root.addEventListener('click', function(event) {
      let rpos = root.createSVGRect();
      let bound = root.getBoundingClientRect();

      let style = getComputedStyle(root);
      let paddingLeft = parseFloat(style['padding-left'].replace('px', ''));
      let paddingTop = parseFloat(style['padding-top'].replace('px', ''));

      let x = event.clientX - bound.left - root.clientLeft - paddingLeft;
      let y = event.clientY - bound.top - root.clientTop - paddingTop;
       
      rpos.x = x;
      rpos.y = y;

      rpos.width = rpos.height = 1;

      console.log(rpos)

      let lists = root.getIntersectionList(rpos, null);
      if(lists.length!== 0) {
        let intersection =  new Set();

        lists.forEach(list => {
          // 只判断是circle的
          if(list.parentElement.nodeName === 'g' 
                && list.parentElement.classList.contains('venn-circle')) {
            let sets = list.parentElement.getAttribute('data-venn-sets');
            let _sets = Number(sets);
    
            if(isNaN(_sets)) {
              // 有'-'字符
              sets.split('_').forEach( name => {
                intersection.add(name);
              })
            } else {
              intersection.add(_sets);
            }
          }
        })

        that.fetchTopic(intersection)
      }
    }) 
  }

  /**
   * @param {Set} set 
   */
  fetchTopic(set) {
    let {sets} = this.state;
    let {step, vennStep, KEY, fetchTopicData} = this.props;

    // 没有点击的circle(set名)
    let notClick = [];
    vennStep.forEach( step => {
      if(!set.has(step)) {
        notClick.push(step)
      }
    })

    notClick.sort();

    let setArr = [];
    for(let s of set.values()) {
      setArr.push(s);
    }

    setArr.sort();
    
    if(sets[setArr.join('-')]) {
      // 点击的所有集合的交集
      let people = new Set(sets[setArr.join('-')]);

      setArr.forEach( e => {
        // 要去掉所有点击的集合 和没有点击的集合的交集
        notClick.forEach(s => {
          if(e < s && sets[e+'-'+s]) {
            sets[s].forEach(id => {
              people.delete(id)
            })
          } 

          if(e > s && sets[s+'-'+e]) {
            sets[s].forEach(id => {
              people.delete(id)
            })
          }
        })
      })

      let param = new FormData();
      for(let id of people.values()) {
        param.append('person_ids[]', id);
      }
      console.log(param)
      fetchTopicData(param, KEY, step);
    } else {
      console.log(setArr)
    }
  }

  updateVenn() {
    let sets = {}, vennSets = [];
    let {group, vennStep} = this.props;
    
    let people = {};
    vennStep.forEach( key => {
      let person_ids = Object.keys(group[key]);
      people[key] = person_ids;
      
      sets[key] = person_ids;

      vennSets.push({
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
       
        sets[arrs.sort().join('-')] = result;

        vennSets.push({
          sets: arrs,
          size: result.length
        })
      }
    }
    
    this.setState({
      sets
    })
    this.initVene(vennSets)
    this.listenClick();
  }

  initVene(sets) {
    d3.select(this.$venn.current).datum(
      sets
    ).call(
      venn.VennDiagram()
        .width(150)
        .height(150)
    )
  }

  render() {

    return (
      <div className="venn" ref={this.$venn}></div>
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
    vennStep: state.vennstep,
    step: state.step,
    KEY: state.KEY,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
      fetchTopicData: (param, key, step) => dispatch(fetchTopicData(param, key, step+1, 1)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Blobs);