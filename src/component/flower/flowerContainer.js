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

const curvePath = (width, type) => {
    let rx1, ry1, rx2 =  100, ry2;

    rx1 = width - rx2;
    ry2 = 100 / (1 + rx1/rx2)
    ry1 = 100 - ry2

    if(type === 1) {
        return ` M 110 0 L 100 5
            A${ry2+10},${rx2+10} 0 0 0 ${100-ry2}, ${rx2+5}
            A${ry1},${rx1} 0 0 1 0, ${width}` 
    } else {
        return `M0,0
            A${ry1},${rx1} 0 0 1 ${ry1}, ${rx1}
            A${ry2+10},${rx2+10} 0 0 0 ${100}, ${rx1 + rx2-5} L 115 ${BOX_WIDTH}` 
    }
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
        let { width, step, leaves, current,  _selected, _nextSelected, _hovered, positions, cb, hovercb} = this.props;
        let { endpoints } = this.state;

        return (
            <svg width={width} height="100%" viewBox={`0 0 ${2 * current * BOX_WIDTH} ${2 * BOX_WIDTH + 100 }`}
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
                            hovercb = {() => {hovercb(step && step[i])}}
                        />
                    ))
                }
                {
                    endpoints.map((point, i) => {
                        return (<path
                            key={'con-' + i}
                            transform ={`translate(${BOX_WIDTH * i},600) rotate(-90)`}
                            // d = {curvePath(BOX_WIDTH, i)}
                            strokeDasharray={_nextSelected === i ? 'none' : 8}
                            fill="transparent" stroke="black"
                        />)
                    })
                }
                {/* <path 
                    transform ={`translate(0,600) rotate(-90)`}
                    d = "M0,0 
                        A100, 173.20508075688772 0 0 1 100, 173.20508075688772 
                        A100, 173.20508075688772 0 0 0 200 346.41016151377545 
                        M 200 346.41016151377545 
                        A100, 173.20508075688772 0 0 0 100, 519.6152422706632 
                        A100, 173.20508075688772 0 0 1 0, 692.8203230275509" 
                    fill="transparent" stroke="black"/> */}
            </svg>
        )
    }
}

export default FlowerContainer;