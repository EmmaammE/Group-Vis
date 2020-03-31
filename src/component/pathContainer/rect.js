import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
// path.css

const RECT_WIDTH = 35;
const RECT_HEIGHT = 15;
const RADIUS = 5;

function renderRect(x, y, label) {
    return (
        <>
            <rect width={2 * RECT_WIDTH} height={2 * RECT_HEIGHT} fill="#fbfbfb" stroke="#aaaaaa"
                x={x} y={y} rx={RADIUS} ry={RADIUS} cursor="pointer" />
            <text x={x + RECT_WIDTH} y={y + RECT_HEIGHT}
                style={{ fontSize: '14px', pointerEvents: 'none' }}
                dominantBaseline="middle" textAnchor="middle"
            >{label}</text>
        </>
    )
}
export function Rect({ x, y, label, cb_over }) {
    return (
        <g onMouseOver={cb_over}>
            {renderRect(x, y, label)}
        </g>
    )
}

export function RectContainer({ label, x, y, index, _onCreated, _onLink,
         cb_link_down, cb_rect_down, modify_label, type = 0 }) {
    const $rect = useRef(null);
    const $input = useRef(null);
    const $edge = useRef(null);
    const [active, setActive] = useState(false);
    const [value, setValue] = useState("");
    const [_label, setLabel] = useState(label);

    useEffect(() => {
        setLabel(label)
    }, [label])

    useEffect(() => {
        // 拖拽rect
        d3.select($rect.current)
            .call(d3.drag().on('drag', _onCreated).on('end', cb_rect_down))
    }, [_onCreated, cb_rect_down])

    useEffect(() => {
        // 绘制link
        d3.select($edge.current)
            .call(d3.drag()
                .subject(() => ({ x: x + RECT_WIDTH, y: y + RECT_HEIGHT, index: index }))
                .on('drag', _onLink).on('end', function () {
                    cb_link_down(d3.event)
                }))
    }, [x, y, index, _onLink, cb_link_down, label])

    function toggleInput() {
        // console.log('click');
        if (active) {
            setActive(false);
            $input.current.blur();
            if (value !== "") {
                setLabel(value)
                setValue("")
                modify_label(value)
            }
        } else {
            setActive(true);
            $input.current.focus();
            setValue("");
        }
    }

    function onInput(event) {
        setValue(event.target.value);
    }

    switch (type) {
        case 1:
            return (
                <g ref={$rect}>
                    <rect width={2 * RECT_WIDTH} height={2 * RECT_HEIGHT} fill="#fbfbfb" stroke="#aaaaaa"
                        x={x} y={y} rx={RADIUS} ry={RADIUS} cursor="pointer" />
                    <foreignObject 
                        x={x - 2} y={y - 2 * RECT_HEIGHT} 
                        width="120px" height={4 * RECT_HEIGHT + 10}>
                        <div className={active ? "input-action" : "input-block"} onClick={toggleInput}>
                            <input className="effect-22" type="text" placeholder=""
                                ref={$input}
                                value={value} onChange={onInput} />
                            <span className="rect-mask" />
                            <label>{_label}</label>
                            <span className="focus-bg"></span>
                        </div>
                    </foreignObject>
                
                    <path ref={$edge}
                        d={`M${x},${y} h${2*RECT_WIDTH} v${2*RECT_HEIGHT} h${-2*RECT_WIDTH} v${-2*RECT_HEIGHT}`} 
                        visibility="hidden"
                        pointerEvents="stroke"
                        cursor="pointer"
                        fill="transparent" 
                        stroke="#aaa" strokeWidth="15px" 
                        strokeLinecap="round" strokeLinejoin="round"
                    />
                </g>
            )
        case 2:
            return (
                <g ref={$rect}>
                    {renderRect(x, y, label)}
                </g>
            )
        default:
            return null;
    }
}