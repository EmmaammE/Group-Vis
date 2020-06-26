import React from "react";
import { connect } from "react-redux";
import { POSITIONS } from "../../util/name";
import { setPerson } from "../../actions/data";
import { DimensionFilter } from "./DimensionFilter";
import './lasso.css';

class DimensionContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.positions ? Object.values(props.positions).map(d => d[2]) : []
        }

        this._modifyPeople = this._modifyPeople.bind(this);
    }

    componentDidUpdate(prevProps) {
        if(JSON.stringify(prevProps.positions) !== JSON.stringify(this.props.positions)) {
            if(this.props.positions!==undefined) {
                this.setState({
                    data: Object.values(this.props.positions).map(d => d[2])
                })
            }
        }
    }

    _modifyPeople(data) {
        if(data.length > 0) {
            this.setState({
                data
            })
        } else {
            this.setState({
                data: Object.values(this.props.positions).map(d => d[2])
            })
        }
    }

    render() {
        let { selectedPeople, peopleStatus, positions} = this.props;
        let { data } = this.state;

        return (
            <div className="dimension-container">
                <div className="dimension-wrapper">
                    
                    {
                        positions && <DimensionFilter 
                            _width={280}
                            _height={280}
                            _margin="translate(0,5)"
                            peopleStatus = {peopleStatus}
                            data={positions}
                            selectedPeople = {selectedPeople}
                            cb = {this._modifyPeople}
                        />
                    }

                </div>
                <div className="list-wrapper">
                    <div className='dimension-legend'> 
                        <span className='example'></span>
                        <span className='g-text title'>Figure</span>
                    </div>
                    <div className='list-container'>
                        <div className='list-title'>Name List</div>
                        <div className="list-item-container g-legend-text">
                        {
                            Object.values(data).map((d,i)=> (
                                <div key={i} className='d-list-item'>
                                    {d}
                                </div>
                            ))
                        }
                        </div>
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