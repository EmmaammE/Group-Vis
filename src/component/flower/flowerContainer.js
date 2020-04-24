import React from 'react';
import Flower from './flower';

const BOX_WIDTH = 250;

const getEndpoints = (next, current) => {
    if( next === -1 ) {
        return [];
    }

    return Array(next).fill(null)
        .map((val, i) => 2*i+1+(current - next))
}

const curvePath = (currPos, point) => {
    let width = BOX_WIDTH * Math.abs(currPos - point)
    let rx1, ry1, rx2 =  100, ry2;

    rx1 = width - rx2;
    ry2 = 100 / (1 + rx1/rx2)
    ry1 = 100 - ry2

    let margin = BOX_WIDTH * currPos;
    let diff = point - currPos;
    if(diff > 0) {
        // 朝向右边
        return ` M 115 ${margin} L 100 ${margin + 5}
            A${ry2+10},${rx2+10} 0 0 0 ${ry1}, ${margin + rx2+5}
            A${ry1},${rx1} 0 0 1 0, ${width+margin}` 
    } else if(diff < 0 ){
        return `M 115 ${margin} L 100 ${margin - 5}
            A${ry2+10},${rx2+10} 0 0 1 ${ry1}, ${margin - rx2 - 5} 
            A${ry1},${rx1} 0 0 0 0, ${margin - width}`
    } else {
        return `M115, ${margin} L0, ${margin}`
    }
}

class FlowerContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            endpoints: getEndpoints(props.next),
            similiarFlags: []
        }
    }

    componentDidUpdate(prevProps) {
        let { next, current, similiarFlag } = this.props;
        if (prevProps.next !== next || prevProps.current !== current) {
            this.setState({
                endpoints: getEndpoints(next, current)
            })
        }

        if( similiarFlag[0] !== -1 && JSON.stringify(prevProps.similiarFlag) !== JSON.stringify(similiarFlag)) {
            let { similiarFlags } = this.state;
            similiarFlags.push(similiarFlag);

            this.setState({
                similiarFlags
            })
        }
    }

    render() {
        let {  max,
                step, leaves, current,  
                _selected, _nextSelected, _hovered, 
                positions, next, cb, hovercb} = this.props;
        let { endpoints, similiarFlags } = this.state;

        let $currPos = 2 * _selected + 1;

        return (
            <svg width="100%" height="100%" viewBox={`0 0 ${2 * max * BOX_WIDTH} ${2 * BOX_WIDTH + 100 }`}
                xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="dropshadow" x="-1" y="-1" width="200" height="200">
                        <feGaussianBlur stdDeviation="2" />
                    </filter>
                </defs>
                <g transform={'translate(' + (max-current) * BOX_WIDTH + ',0)'}>
                {
                    Array(current).fill(null).map((arr, i) => (
                        <Flower
                            marginWidth={BOX_WIDTH * 2 * i} key={"flo-" + i} 
                            leaves ={ leaves[i]}
                            _selected={_selected === i}
                            _hovered={_hovered === i}
                            positions={positions && positions[i]}
                            cb={() => {cb(step && step[i])}}
                            step={step && step[i]}
                            current={current}
                            hovercb = {() => {hovercb(step && step[i])}}
                        />
                    ))
                }
                {
                    endpoints.map((point, i) => {
                        return (<path
                            key={'con-' + i}
                            className={[i === endpoints.length-1 ? "connect-line" : ''
                                , _nextSelected !== i ? 'unset-line': ''].join(' ')}
                            transform ={`translate(0, 600) rotate(-90)`}
                            d = {curvePath($currPos, point)} 
                            fill="transparent" stroke="black"
                        />)
                    })
                }
                </g>
                {/* <path 
                    transform ={`translate(0,600) rotate(-90)`}
                    d = "M0,0 
                        A100, 173.20508075688772 0 0 1 100, 173.20508075688772 
                        A100, 173.20508075688772 0 0 0 200 346.41016151377545 
                        M 200 346.41016151377545 
                        A100, 173.20508075688772 0 0 0 100, 519.6152422706632 
                        A100, 173.20508075688772 0 0 1 0, 692.8203230275509" 
                    fill="transparent" stroke="black"/> */}
                {
                    similiarFlags.length !== 0 &&
                        similiarFlags.map((flag, index) => 
                            flag[0]-1 === _selected 
                            ? (
                                <g key={'flag-'+index}>
                                    <path
                                        className="unset-line"
                                        d = {`M ${BOX_WIDTH * 2 * flag[0] - BOX_WIDTH/2} ${BOX_WIDTH} L ${BOX_WIDTH * 2 * flag[0] + BOX_WIDTH/2 }, ${BOX_WIDTH} `}
                                        fill="transparent" stroke="black"
                                    />
                                    <path
                                        transform ={`translate(0, 600) rotate(-90)`}
                                        className="unset-line"
                                        d = {curvePath(2*flag[0]+1, endpoints[flag[1]])}
                                        fill="transparent" stroke="black"
                                    />
                                </g> )
                            : null
                        )
                }
            </svg>
        )
    }
}

export default FlowerContainer;