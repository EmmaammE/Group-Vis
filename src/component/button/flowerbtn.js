import React, { useState, useEffect } from "react";
import './flowerbtn.css';

const pentals = 5;

export function Flowerbtn({cb, active}) {
    const [_active, setActive] = useState(false);

    useEffect(() => {
        if(active!==undefined && active === false) {
            setActive(active)
        }
    },[active])

    function onClick() {
        setActive(!_active);
        cb();
    }

    return (
        <div className="flowerbtns"  onClick={onClick}>
            {
                Array(pentals).fill(false).map((e,i) => (
                    <div key={"fl"+i} className={["raindrop", 
                        (active!==undefined && active)||(active===undefined && _active)?"active":''].join(' ')}>
                    </div>
                ))
            }
            <div className={["inner",
                (active!==undefined && active)||(active===undefined && _active)?"active":''].join(' ')}>
            </div>
        </div> 
    )
}