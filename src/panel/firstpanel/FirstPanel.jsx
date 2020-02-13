import React from 'react';
import './firstPanel.css'

import Blobs from '../../component/blob/blob'
import SelectedPanel from '../../component/selectedPanel/selectedPanel';

const dataSet = [
    {title: '朝代', options: []},
    {title: '年份', options: []},
    {title: '性别', options: []},
    {title: '社会区分', options: []},
]
class FirstPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchValue: "",
        }

        this.onInputChange = this.onInputChange.bind(this);
    }

    onInputChange(event) {
        console.log(event.target.value);
        this.setState({
            searchValue: event.target.value
        })
    }

    render() {
        let { searchValue } = this.state;
        return (
            <div className="first-panel">
                <h1 className="big-title">Group Vis</h1>
                <div className="content-container">
                    <div className="title">Overview</div>
                        <Blobs />
                        <div className="title">Control Panel</div>
                        <div className="search-container">
                            <div className="input-outline">
                                <input 
                                    className = "search-input" 
                                    value = {searchValue} 
                                    onChange = {this.onInputChange}
                                />
                            </div>
                            <span className="search-icon"> 
                                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                                    <path d="M416 192C537.6 192 640 294.4 640 416S537.6 640 416 640 192 537.6 192 416 294.4 192 416 192M416 128C256 128 128 256 128 416S256 704 416 704 704 576 704 416 576 128 416 128L416 128z"></path>
                                    <path d="M832 864c-6.4 0-19.2 0-25.6-6.4l-192-192c-12.8-12.8-12.8-32 0-44.8s32-12.8 44.8 0l192 192c12.8 12.8 12.8 32 0 44.8C851.2 864 838.4 864 832 864z"></path>
                                </svg>
                            </span>
                    </div>
                    {dataSet.map((datum, index) => (
                        <SelectedPanel key={`datum-${index}`} title={datum.title}/>
                    ))}
                    <div className="btn-container">
                        <button className="btn">Search</button>
                        <button className="btn btn-delete">Delete</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default FirstPanel;