import React from 'react';
import Flower from './flower';

const BOX_WIDTH = 250;

const getEndpoints = (number, current) => {
    if (number === -1) {
        return [];
    } else {
        return Array(number).fill(null)
            .map((val, i) => BOX_WIDTH * (1/2 + i))
    }
}

const control = (p1x, p1y, p2x, p2y, offset = 30) => {
   let mpx = (p1x + p2x) * 0.5;
   let mpy = (p1y + p2y) * 0.5;
   
   let theta = Math.atan2(p2y - p1y, p2x - p1x) - Math.PI / 2;
   
   let c1x = mpx + offset * Math.cos(theta);
   let c1y = mpy + offset * Math.sin(theta);

   return {
       x: c1x,
       y: c1y
   };
}

const curvePath = (p1x, p1y, p2x, p2y) => {
    let mdx = (p1x+p2x) * 0.5;
    let mdy = (p2x+p2y) * 0.5;

    let c1 = control(p1x, p1y, mdx, mdy);
    let c2 = control(mdx, mdy, p2x, p2y)
    return  `M${p1x} ${p1y} Q${c1.x} ${c1.y} ${mdx} ${mdy} M ${mdx} ${mdy}Q${c2.x} ${c2.y} ${p2x} ${p2y}` ;
}
class FlowerContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            endpoints: getEndpoints(props.next)
        }
    }

    componentDidUpdate(prevProps) {
        let { next, current } = this.props;
        if (prevProps.next !== next || prevProps.current !== current) {
            this.setState({
                endpoints: getEndpoints(next, current)
            })
        }
    }

    render() {
        let { width, step, leaves, current,  _selected, _nextSelected, _hovered, positions, cb } = this.props;
        let { endpoints } = this.state;

        return (
            <svg width={width} height="100%" viewBox={`0 0 ${2 * current * BOX_WIDTH} ${2 * BOX_WIDTH }`}
                xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="dropshadow" x="-1" y="-1" width="200" height="200">
                        <feGaussianBlur stdDeviation="2" />
                    </filter>
                </defs>
                {
                    Array(current).fill(null).map((arr, i) => (
                        <Flower
                            marginWidth={BOX_WIDTH * 2 * i} key={"flo-" + i} 
                            leaves ={leaves && leaves[i]}
                            _selected={_selected === i}
                            _hovered={_hovered === i}
                            positions={positions && positions[i]}
                            cb={() => {cb(step && step[i])}}
                            step={step && step[i]}
                            current={current}
                        />
                    ))
                }
                {
                    endpoints.map((point, i) => {
                        return (<path
                            key={'con-' + i}
                            // d = {curvePath(BOX_WIDTH*(2*_selected+1), 360, point, 2*BOX_WIDTH)}
                            strokeDasharray={_nextSelected === i ? 'none' : 8}
                            fill="transparent" stroke="black"
                        />)
                    })
                }
            </svg>
        )
    }
}

export default FlowerContainer;