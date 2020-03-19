import React from 'react';
import './map.css';
import Map from './map';
import legend from '../../assets/img/legendmap.png';
import { connect } from 'react-redux';
import axios from 'axios';
// import {data} from '../../data/ming'
class MapContainer extends React.Component {
    state = {
        // addr: {
        // "21": [{"x_coord": 106.631752, "y_coord": 30.47769, "address_name": "\u6e20\u6c5f"}], 
        // "23": [{"x_coord": 108.631752, "y_coord": 32.47769, "address_name": "\u6e20\u6c5f"}]}
    }

    componentDidUpdate(prevProps) {
        let {people} = this.props;
        if(JSON.stringify(prevProps.people)!==JSON.stringify(people)) {
            let that = this;
            let param = new FormData();
            for(let _key in people) {
                param.append("person_ids[]", _key);
            }
            axios.post('/search_address_by_person_ids/', param)
                .then(res => {
                    if(res.data.is_success) {
                        // console.log(res.data);
                        let addr = {};
                        for(let _data in res.data["Addr"]) {
                            addr[people[_data]] = res.data["Addr"][_data];
                        }
                        that.setState({
                            addr: addr
                        })
                    } else {
                        if(res.data.bug) {
                            console.error(res.data.bug);
                        }
                    }
                })
        }
    }

    render() {
        let {addr} = this.state;
        return (
            <div className="geomap">
                <div className="title">Map View</div>
                <img className="legend" src={legend} alt="legend" />
                <div className="container"><Map addr={addr} /></div>
            </div>
        )
    }

}

const mapStateToProps = state => {
    let step = state.otherStep["9"];
    // console.log(step);
    return {
        people: state.group[step] && state.group[step]["people"]
    }
}

export default connect(mapStateToProps)(MapContainer);