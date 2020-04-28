import React from 'react';
import Flower from './flower';

const BOX_WIDTH = 250;

const getEndpoints = (points, next, current) => {
    if(next === -1) {
        return []
    }
    return points.map(val => [val, 2*val+1+(current - next)])
}

const curvePath = (currPos, point) => {
    let width = BOX_WIDTH * Math.abs(currPos - point)
    let rx1, ry1, rx2 =  100, ry2;

    rx1 = width - rx2;
    ry2 = 100 / (1 + rx1/rx2)
    ry1 = 100 - ry2

    let margin = BOX_WIDTH * currPos;
    let diff = point - currPos;
    let offset = width / 25
    if(diff > 0) {
        // 朝向右边
        return ` M 115 ${margin} L 100 ${margin + offset/2}
            A${ry2+offset},${rx2+offset} 0 0 0 ${ry1}, ${margin + rx2+offset/2}
            A${ry1},${rx1} 0 0 1 0, ${width+margin}` 
    } else if(diff < 0 ){
        return `M 115 ${margin} L 100 ${margin - 5}
            A${ry2+offset},${rx2+offset} 0 0 1 ${ry1}, ${margin - rx2 - offset/2} 
            A${ry1},${rx1} 0 0 0 0, ${margin - width}`
    } else {
        return `M115, ${margin} L0, ${margin}`
    }
}

const _getPoints = (connections, next, current) => {
    let endpoints = {};
    for(let key in connections) {
        endpoints[key] = getEndpoints(connections[key], next, current)
    }
    return endpoints;
}

class FlowerContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // { 选中的花朵： [花朵下的endpoints数组] }
            endpoints: _getPoints(props.connections, props.next, props.current),
            similiarFlags: []
        }
    }

    componentDidUpdate(prevProps) {
        let { next, current, similiarFlag, connections } = this.props;
        if (JSON.stringify(connections)!==JSON.stringify(prevProps.connections)
            || next !== prevProps.next || current !== prevProps.current
        ) {
            this.setState({
                endpoints: _getPoints(connections, next, current)
            })
        }

        if( similiarFlag.length !== 0 && JSON.stringify(prevProps.similiarFlag) !== JSON.stringify(similiarFlag)) {
            this.setState({
                similiarFlags: similiarFlag
            })
        }
    }

    

    render() {
        let {  max,
                step, leaves, current,  
                _selected, _nextSelected, _hovered, 
                positions, next, cb, hovercb} = this.props;
        let { endpoints, similiarFlags } = this.state;

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
                            max = {max}
                        />
                    ))
                }
                {
                    Object.keys(endpoints).map(key => {
                        let _endpoints = endpoints[key];
                        return _endpoints.map( points => (
                            <path
                                key={'con-' + points}
                                // className={[key === points[0] ? "connect-line" : ''
                                //     , _nextSelected !== key ? 'unset-line': ''].join(' ')}
                                transform ={`translate(0, 600) rotate(-90)`}
                                d = {curvePath(2*key+1, points[1])} 
                                fill="transparent" stroke="#9a9a9a"
                            />
                        ))
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
                    fill="transparent" stroke="#9a9a9a"/> */}
                {
                    similiarFlags.length !== 0 &&
                        similiarFlags.map((flag, index) => {
                            let start, end;
                            if(current > next) {
                                start = 2 * flag[2] + 1;
                                end = 2 * flag[1] + 1 + current - next;
                            } else {
                                start = 2 * flag[2] + 1 + next - current;
                                end = 2 * flag[1] + 1;
                            }

                            return <g key={'flag-'+index}>
                                <path
                                    className="unset-line"
                                    d = {`M ${BOX_WIDTH * (start + 1/2)} ${BOX_WIDTH} L ${BOX_WIDTH * (start + 3/2 ) }, ${BOX_WIDTH} `}
                                    fill="transparent" stroke="#9a9a9a"
                                />
                                <path
                                    transform ={`translate(0, 600) rotate(-90)`}
                                    className="unset-line"
                                    d = {curvePath(start + 2, end)}
                                    fill="transparent" stroke="#9a9a9a"
                                />
                                <path
                                    transform ={`translate(0, 600) rotate(-90)`}
                                    className="unset-line"
                                    d = {curvePath(start, end)}
                                    fill="transparent" stroke="#9a9a9a"
                                />
                            </g> 
                        })
                }
            </svg>
        )
    }
}

export default FlowerContainer;