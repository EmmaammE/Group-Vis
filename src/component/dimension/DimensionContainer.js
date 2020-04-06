import React from "react";
import { connect } from "react-redux";
import { POSITIONS, SIMILAR_PEOPLE } from "../../util/name";
import { setPerson } from "../../actions/data";
import { DimensionFilter } from "./Dimensions";
import './lasso.css';
import {fetchTopicData} from '../../actions/step';

const style = {
    position: 'relative',
    display: 'flex',
    height: '100%',
    flexDirection: 'column'
}

const flowerClass = (status) => {
    switch (status) {
        case 0:
            // 没有相似的人，不能点击
            return 'btn-add cannot-click'
        case 1:
            // 可以点击， 未点击
            return 'btn-add'
        case 2:
            // 已点击
            return 'btn-add active'
        default:
            break;
    }
}
class DimensionContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            active: 0
        }
        this.onClickFlower = this.onClickFlower.bind(this);
    }

    componentDidUpdate() {
        if(this.props["similar"] && this.props["similar"].length!==0 && this.state.active === 0) {
            this.setState({
                active: 1
            })
        }

        // if(this.props[''])
    }
    onClickFlower() {
        let {active} = this.state;
        if(active !== 0) {
            let {positions, similar, step, KEY,fetchTopic} = this.props;
        
            let param = new FormData();
            Object.values(positions).map(d => d[2]).forEach(person_id => {
                param.append("person_ids[]", person_id)
            })
            similar.forEach(person_id => {
                param.append("person_ids[]", person_id)
            })
    
            fetchTopic(param, KEY, step);
            this.setState({
                active: 2
            })
        }
    }

    render() {
        let { positions, selectedPeople } = this.props;
        let {active}= this.state;
        
        return (
            <div style={style}>
                <p className="title">Reduced-dimension View</p>
                <div style={{position: 'relative'}}>
                    <div className={flowerClass(active)}
                        onClick={this.onClickFlower}>
                        <div className="ball" />
                        
                        <div className="pental first"></div>
                        <div className="pental second"></div>
                    </div>
                    {
                        positions &&
                            <svg viewBox={"0 0 340 340"} style={{flex: 1}} >
                                <DimensionFilter 
                                    _width={280}
                                    _height={280}
                                    _margin="translate(20,0)"
                                    data={positions}
                                    selectedPeople = {selectedPeople}
                                />
                            </svg>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    let step = state.otherStep["6"];
    return {
        selectedPeople: state.people,
        positions: state.group[step] && state.group[step][POSITIONS],
        similar: state.group[step] && state.group[step][SIMILAR_PEOPLE],
        step: state.step,
        KEY: state.KEY
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setPerson: person => dispatch(setPerson(person)),
        fetchTopic: (param, KEY, step) => dispatch(fetchTopicData(param, KEY, step+1, 1)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DimensionContainer); 