import React from "react";
import Dimension from "./Dimension";
import { connect } from "react-redux";

class DimensionContainer extends React.Component {
    render() {
        let { positions } = this.props;
        if (positions === undefined) {
            return <div></div>;
        }

        return (
            <div>
                <svg viewBox={"0 0 340 300"} width={"340px"} height={"300px"}>
                    <Dimension
                        _width={250}
                        _height={250}
                        _margin="translate(40,25)"
                        data={Object.values(this.props.positions)}
                    />
                </svg>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        positions: state.topicData["person2positions"]
    };
};

export default connect(mapStateToProps)(DimensionContainer);