import React, { useEffect, useState } from 'react';

const BOX_WIDTH = 250;
const RADIUS = 100;

const petalPath = [
    'M0,0',
    "C40,50 50,100 0,100",
    "C-40,100 -50,50 0,0"
]

function Petal({number, title, color='#7483a9'}) {
    const [arr, setArr] = useState([]);

    useEffect(() => {
        let _arr = [];
        for (let i = 0; i < number; i++) {
            _arr.push((360/number) * i)         
        }
        setArr(_arr);
    }, [number])

    return (
        <g>
            {arr.map((angle, index) => (
                <g transform={'translate(' + [BOX_WIDTH, BOX_WIDTH] + ')'} key={'petal-'+index}>
                    <g transform={`rotate(${angle}) scale(1.2)`}>
                        <path 
                            key={'petal-'+index} 
                            d ={petalPath}
                            fill = {color}
                            style = {{mask: "url(#mask-stripe)"}}
                        />
                        <line x1="0" y1="102" x2="0" y2="114" stroke="black" strokeWidth="1px"/>
                    </g>
                    <text x="-40" y="0" transform={`translate(${160*Math.cos((angle+90)*Math.PI/180)},${160*Math.sin((angle+90)*Math.PI/180)})`}>Property-{index}</text>
                </g>
            ))}
        </g>
    )
}

class Flower extends React.Component {


    render() {
        // TODO 获得要展示的属性值
        let {number} = this.props;
        // the number of petals
        return (
            <svg width="100%" height="100%" viewBox={`0 0 ${2 * BOX_WIDTH} ${1.7 * BOX_WIDTH}`} xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="pattern-stripe" 
                        width="100" height="3" 
                        patternUnits="userSpaceOnUse"
                    >
                        <rect width="100" height="1" transform="translate(0,0)" fill="white"></rect>
                    </pattern>
                    <mask id="mask-stripe">
                        <circle 
                            r={250}
                            fill="url(#pattern-stripe)" 
                        />
                    </mask>      
                </defs>
                <Petal number={number} />
                <circle cx="250" cy="250" r={RADIUS} fill="white" />
            </svg>
        )
    }
}

export default Flower;