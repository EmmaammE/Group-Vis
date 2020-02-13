import React, { useEffect, useState } from 'react';

const BOX_WIDTH = 250;
const RADIUS = 120;

const petalPath = [
    'M0,0',
    "C40,50 50,100 0,100",
    "C-40,100 -50,50 0,0"
]

function Petal({number, color='#7483a9'}) {
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
                <path 
                    key={'petal-'+index} 
                    transform={'translate(' + [BOX_WIDTH, BOX_WIDTH] + ') rotate(' + [angle] + ') scale(1.5)'}
                    d ={petalPath}
                    fill = {color}
                    // stroke = "black"
                    style = {{mask: "url(#mask-stripe)"}}
                />
            ))}
        </g>
    )
}

class Flower extends React.Component {


    render() {
        // the number of petals
        return (
            <svg width="100%" height="100%" viewBox={`0 0 ${2 * BOX_WIDTH} ${2 * BOX_WIDTH}`} xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="filter" filterUnits="userSpaceOnUse" x="-5" y="-5" height="1000" width="1000">
                        <feTurbulence baseFrequency="0.2" numOctaves="3" type="fractalNoise" />
                        <feDisplacementMap  scale="8"  xChannelSelector="R" in="SourceGraphic" />
                    </filter>
                    <pattern id="pattern-stripe" 
                        width="100" height="2" 
                        patternUnits="userSpaceOnUse"
                    >
                        <rect width="100" height="1" transform="translate(0,0)" fill="white" style={{filter:"url(#filter)"}} ></rect>
                    </pattern>
                    <mask id="mask-stripe">
                        <circle 
                            r={250}
                            fill="url(#pattern-stripe)" 
                        />
                    </mask>      
                </defs>
                <Petal number={7} />
                <circle cx="250" cy="250" r={RADIUS} fill="white" />
            </svg>
        )
    }
}

export default Flower;