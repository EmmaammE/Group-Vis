import React from 'react';
import './map.css';
import Map from './map';
import legend from '../../assets/img/legendmap.png';


class MapContainer extends React.Component {

    render() {
        return (
            <div className="geomap">
                <div className="title">Map View</div>
                <img className="legend" src={legend} alt="legend" />
                <div className="container"><Map /></div>
            </div>
        )
    }

}

export default MapContainer;