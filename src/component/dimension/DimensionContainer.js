import React from "react";
import Dimension from "./Dimension";
import { connect } from "react-redux";
import { POSITIONS } from "../../util/name";
import { setPerson } from "../../actions/data";

const style = {
    position: 'relative',
    display: 'flex',
    height: '100%',
    flexDirection: 'column'
}
class DimensionContainer extends React.Component {

 
    render() {
        let { positions, selectedPeople } = this.props;
        
        return (
            <div style={style}>
                <p className="title">Reduced-dimension View</p>
                {
                    positions &&
                    <svg viewBox={"0 0 340 300"} style={{flex: 1}} >
                        <Dimension 
                            _width={250}
                            _height={250}
                            _margin="translate(40,25)"
                            data={positions}
                            selectedPeople = {selectedPeople}
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
        selectedPeople: state.people,
        positions: state.group[step] && state.group[step][POSITIONS]
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setPerson: person => dispatch(setPerson(person))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DimensionContainer); 