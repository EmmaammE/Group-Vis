import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

function Axis({ orient, scale, ticks, format, translate }) {
    const axisRef = useRef();

    useEffect(() => {
        const axisMethod = { 'top': "axisTop", 'bottom': "axisBottom", 'left': "axisLeft", 'right': "axisRight" }[orient];
        let axis = d3[axisMethod](scale)
            .ticks(ticks);
        if (format !== undefined) {
            axis = axis.tickFormat(format)
        }

        d3.select(axisRef.current).call(axis);
    }, [scale, orient, translate, ticks, format])

    return (
        <g
            className="custome-axis"
            ref={axisRef}
            transform={translate}
        />
    )
}

export default Axis;