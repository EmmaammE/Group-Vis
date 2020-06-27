import React from 'react';
import './map.css';
import Map from './map';
import { connect } from 'react-redux';
import axios from '../../util/http';
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
            if(data !== undefined && data["pos2sentence"]) {
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
                                    let curr  = res.data["Addr"][_data][0];
                                    if(curr && curr['x_coord']!== null && curr['y_coord']!==null) {
                                        addr[_data] = res.data["Addr"][_data][0];
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
    }

    render() {
        let {addr} = this.state;
        let {data} = this.props;
        let sentence2pos = {}, pos2sentence = {}

        if(data) {
            sentence2pos = Object.assign({}, data['sentence2pos'])
            pos2sentence = Object.assign({}, data['pos2sentence'])
    
            if(data && addr) {
                for(let key in pos2sentence) {
                    
                    pos2sentence[key] = pos2sentence[key]
                        .filter(d => sentence2pos[d["sentence"]]['show'] === true)
                }
            } 
        }

        return ( 
            <div className="chart-wrapper geomap ">
                <div className="g-chart-title">Figure Traces</div>
                <div className="container">
                    <Map addr={addr} sentence2pos={addr && sentence2pos} pos2sentence={addr && pos2sentence} />
                </div>
            </div>
        )
    }

}

const mapStateToProps = state => {
    let step = state.otherStep["9"];
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