import React from 'react';
import Flower from './flower';

const BOX_WIDTH = 250;

const getEndpoints = (number, size) => {
    if (number === -1) {
        return [];
    } else {
        return Array(number).fill(null)
            .map((val, i) => size * BOX_WIDTH )
    }
}

class FlowerContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            endpoints: getEndpoints(props.next, props.current)
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
        // let { leaves, current, _showUpLine, _selected, _nextSelected, _hovered, titles, positions, _ratio, step } = this.props;
        let { step, leaves, current, next, _selected, _nextSelected, _hovered, positions, cb } = this.props;
        let { endpoints } = this.state;

        return (
            <svg width="80%" height="100%" viewBox={`0 0 ${2 * current * BOX_WIDTH} ${2 * BOX_WIDTH }`}
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
                            // titles={titles && titles[i]}
                            // _showUpLine={_showUpLine}
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
                        let x1 = (BOX_WIDTH * (2 * _selected + 1) + point) * 2 / 7, 
                            y1 = 360,
                            x2 = (BOX_WIDTH * (2 * _selected + 1) + point) * 4 / 7, 
                            y2 = 2 * BOX_WIDTH;
                        return (<path
                            key={'con-' + i}
                            d={`M${BOX_WIDTH*(2*_selected+1)} 360 v10 L${point},${2*BOX_WIDTH}`} 
                            // d={`M${x1},360 Q${x1},320 ${x2},320 Q${x2},320 ${x2}, 300`}
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