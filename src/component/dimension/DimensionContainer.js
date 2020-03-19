import React from "react";
import Dimension from "./Dimension";
import { connect } from "react-redux";
import { POSITIONS } from "../../util/name";

class DimensionContainer extends React.Component {
    render() {
        let { positions } = this.props;
        
        return (
            <div style={{position: 'relative'}}>
                <p className="title">XXX-View</p>
                {
                    positions &&
                    <svg viewBox={"0 0 340 300"} width={"340px"} height={"300px"}>
                        <Dimension
                            _width={250}
                            _height={250}
                            _margin="translate(40,25)"
                            data={positions}
                        />
                </svg>
                }
            </div>
        );
    }
}

const mapStateToProps = state => {
    let step = state.otherStep["6"];
    return {
        positions: state.group[step] && state.group[step][POSITIONS]
    }
}

export default connect(mapStateToProps)(DimensionContainer); 