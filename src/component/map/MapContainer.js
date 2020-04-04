import React from 'react';
import './map.css';
import Map from './map';
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
        let {data} = this.props;
        if(JSON.stringify(prevProps.data)!==JSON.stringify(data)) {
            let that = this;
            let param = new FormData();
            for(let _key in data["addressNode"]) {
                param.append("address_ids[]", _key);
            }

            console.log(data);
            axios.post('/search_address_by_address_ids/', param)
                .then(res => {
                    if(res.data.is_success) {
                        // console.log(res.data);
                        let addr = {};
                        for(let _data in res.data["Addr"]) {
                            addr[_data] = res.data["Addr"][_data][0];
                            if(addr[_data]) {
                                addr[_data]['address_name'] = data["addressNode"][_data]
                            }
                        }
                        that.setState({
                            addr
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
                <div className="container"><Map addr={addr} /></div>
            </div>
        )
    }

}

const mapStateToProps = state => {
    let step = state.otherStep["9"];
    // console.log(step);
    return {
        // "mapView": {
        //     pos2sentence,
        //     addressNode: addressMap['addressNode']
        // },
        data: state.group[step] && state.group[step]["mapView"]
    }
}

export default connect(mapStateToProps)(MapContainer);