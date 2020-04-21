import React from "react";
import { connect } from "react-redux";
import { POSITIONS } from "../../util/name";
import { setPerson } from "../../actions/data";
import { DimensionFilter } from "./DimensionFilter";
import './lasso.css';

const style = {
    position: 'relative',
    display: 'flex',
    height: '100%',
    flexDirection: 'column'
}

class DimensionContainer extends React.Component {
    render() {
        let { positions, selectedPeople, peopleOfGroup} = this.props;
        return (
            <div className="chart-wrapper" style={style}>
                <p className="g-chart-title title">Figure View</p>
                {
                    positions &&
                        <svg viewBox={"0 0 340 340"} style={{flex: 1}} >
                            <DimensionFilter 
                                _width={300}
                                _height={300}
                                _margin="translate(20,40)"
                                peopleOfGroup = {peopleOfGroup}
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
    if(isNaN(Number(step)) && state.otherStep["6"]!==undefined) {
        // 是群体对比的step
        let steps = step.split('-')
        return {
            selectedPeople: state.people,
            positions: state.group[step] && state.group[step][POSITIONS],
            peopleOfGroup: [
                Object.keys(state.group[steps[0]]['people']), 
                Object.keys(state.group[steps[1]]['people'])
            ]
        }
    } else {
        return {
            selectedPeople: state.people,
            positions: state.group[step] && state.group[step][POSITIONS],
        }
    }
    
}

const mapDispatchToProps = dispatch => {
    return {
        setPerson: person => dispatch(setPerson(person)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DimensionContainer); 