import React from "react";
import { connect } from "react-redux";
import { POSITIONS } from "../../util/name";
import { setPerson } from "../../actions/data";
import { DimensionFilter } from "./DimensionFilter";
import './lasso.css';

const style = {
   display: 'flex',
   justifyContent: 'center',
   alignItems: 'center'
}

class DimensionContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.positions
        }

        this._modifyPeople = this._modifyPeople.bind(this);
    }

    componentDidUpdate(prevProps) {
        if(JSON.stringify(prevProps.positions) !== JSON.stringify(this.props.positions)) {
            this.setState({
                data: Object.values(this.props.positions).map(d => d[2])
            })
        }
    }

    _modifyPeople(data) {
        this.setState({
            data
        })
    }

    render() {
        let { selectedPeople, peopleStatus, positions} = this.props;
        let { data } = this.state;

        return (
            <div className="dimension-container">
                <div className="chart-wrapper" style={style}>
                    {
                        data &&
                            <svg viewBox={"0 0 340 340"} width="85%" height="85%">
                                <DimensionFilter 
                                    _width={280}
                                    _height={280}
                                    _margin="translate(20,20)"
                                    peopleStatus = {peopleStatus}
                                    data={positions}
                                    selectedPeople = {selectedPeople}
                                    cb = {this._modifyPeople}
                                />
                            </svg>
                    }
                </div>
                <div className="list-wrapper">
                    <div className='dimension-legend'>
                        <span className='example'></span>
                        <span className='g-text title'>Figure Embedding</span>
                    </div>
                    <div className="list-container">
                        {
                            data && Object.values(data).map((d,i)=> (
                                <div key={i} className='g-text d-list-item'>
                                    {d}
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
            
        );
    }
}

const mapStateToProps = state => {
    let step = state.otherStep["6"];
    if(isNaN(Number(step)) && state.otherStep["6"]!==undefined) {
        // 是群体对比的step
        return {
            selectedPeople: state.people,
            positions: state.group[step] && state.group[step][POSITIONS],
            peopleStatus: state.group[step] && state.group[step]["people"]
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