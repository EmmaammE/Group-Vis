import React from 'react';
import './map.css';
import Map from './map';
import legend from '../../assets/img/legendmap.png';
import { connect } from 'react-redux';
import axios from 'axios';

class MapContainer extends React.Component {
    state = {
        addr: {}
    }

    componentDidUpdate(prevProps) {
        let {person_} = this.props;
        if(JSON.stringify(prevProps.person_)!==JSON.stringify(person_)) {
            let that = this;
            let param = new FormData();
            for(let _key in person_) {
                param.append("person_ids[]", _key);
            }
            axios.post('/search_address_by_person_ids/', param)
                .then(response => {
                    if(response.data.is_success) {
                        that.setState({
                            addr: response.data["Addr"]
                        })
                    } else {
                        if(response.data.bug) {
                            console.error(response.data.bug);
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

const mapStateToProps = (state) => {
    return {
       person_: state.person
    }
}

export default connect(mapStateToProps)(MapContainer);