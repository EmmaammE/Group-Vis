import React from 'react';
import Flower from './flower';
import Dimension from '../dimension/Dimension';

const BOX_WIDTH = 250;

const getEndpoints = (number, size) => {
    if (number === -1) {
        return [];
    } else {
        return Array(number).fill(null)
            .map((val,i) => size * BOX_WIDTH/number*(2*i+1))
    }
}

class FlowerContainer extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            endpoints: getEndpoints(props.next, props.current)
        }
    }

    componentDidUpdate(prevProps){
        let {next, current} = this.props;
        if (prevProps.next !== next) {
            this.setState({
                endpoints: getEndpoints(next, current)
            })
        }
    }

    render() {
        let {leaves,current,_showUpLine,_selected,_nextSelected,_hovered,titles,positions} = this.props;
        let {endpoints} = this.state;

        return (
            <svg width="100%" height="100%" viewBox={`0 0 ${2 * current * BOX_WIDTH} ${2 * BOX_WIDTH}`} 
                    xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="pattern-stripe" 
                        width="100" height="3" 
                        patternUnits="userSpaceOnUse"
                    >
                        <rect width="100" height="1" transform="translate(0,0)" fill="white"></rect>
                    </pattern>
                    <mask id="mask-stripe">
                        <circle 
                            r={BOX_WIDTH}
                            fill="url(#pattern-stripe)" 
                        />
                    </mask>
                    <filter id="dropshadow" x="-3" y="-3" width="200" height="200">
                        <feGaussianBlur  stdDeviation="10"/>
                    </filter>
                </defs>
                {
                    Array(current).fill(null).map((arr, i) => (
                        <Flower 
                            marginWidth = {BOX_WIDTH*2*i} key={"flo-"+i} number={leaves[i]}
                            titles = {titles}
                            _showUpLine = {_showUpLine}
                            _selected = {_selected===i}
                            _hovered = {_hovered===i}
                        />
                    ))
                }
                {
                    endpoints.map((point, i) => (
                        <path 
                            key={'con-'+i} d={`M${BOX_WIDTH*(2*_selected+1)} 360 v10 L${point},${2*BOX_WIDTH}`} 
                            fill = "transparent" stroke="black"
                            strokeDasharray = {_nextSelected===i?"":"5 6"}
                        /> 
                    ))
                }
                <Dimension
                    _width={60}
                    _height={60}
                    _margin = {"translate(250,250)"}
                    data={Object.values(positions)}
                />
            </svg>
        )
    }
}

export default FlowerContainer;