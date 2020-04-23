import React from 'react';
import './map.css';
import Map from './map';
import { connect } from 'react-redux';
import axios from 'axios';
import mapLogal from '../../assets/icon/mapLogal.svg'
// import {data} from '../../data/ming'
class MapContainer extends React.Component {
    state = {
        // addr: {
        // "21": [{"x_coord": 106.631752, "y_coord": 30.47769, "address_name": "\u6e20\u6c5f"}], 
        // "23": [{"x_coord": 108.631752, "y_coord": 32.47769, "address_name": "\u6e20\u6c5f"}]}
    }

    componentDidUpdate(prevProps) {
        let {data} = this.props;
        // console.log("mapView",data)
        if(JSON.stringify(prevProps.data)!==JSON.stringify(data)) {
            let that = this;
            if(Object.keys(data["pos2sentence"]).length!==0) {
                let param = new FormData();
                for(let _key in data["pos2sentence"]) {
                    param.append("address_ids[]", _key);
                }
    
                // console.log(data);
                axios.post('/search_address_by_address_ids/', param)
                    .then(res => {
                        if(res.data.is_success) {
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
    }

    render() {
        let {addr} = this.state;
        let {data} = this.props;
        return ( 
            <div className="chart-wrapper geomap ">
                <div className="title">Map View</div>
                <div className = "mapView-label-container">
                    <div className="mapView-label">
                        <svg width="36px" height="18px">
                            <image
                                width="100%" 
                                height="100%" 
                                xlinkHref={mapLogal}
                            />
                        </svg>
                    </div>
                    <p className="mapView-label mapView-label-text">#Descriptions</p>
                </div>
                <div className="container"><Map addr={addr} pos2sentence={data && data["pos2sentence"]} sentence2pos={data && data["sentence2pos"]} /></div>
            </div>
        )
    }

}

const mapStateToProps = state => {
    let step = state.otherStep["9"];
    // console.log(step);
    return {
        // NOTE sentence2pos[---上面的sentence---] = [pos, pos...]
        // NOTE pos2sentence[pos] = [ {sentence: Number, type: 'string', topic: 'vKey'} ]
        // "mapView": {
        //     pos2sentence,
        //     addressNode: addressMap['addressNode'],
        //     sentence2pos
        // },
        data: state.group[step] && state.group[step]["mapView"]
    }
}

export default connect(mapStateToProps)(MapContainer);