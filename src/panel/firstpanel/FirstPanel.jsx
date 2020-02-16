import React from 'react';
import './firstPanel.css';
import logo from '../../assets/logo.svg';
import slogo from '../../assets/search.svg';

import Blobs from '../../component/blob/blob';
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
                <h1 className="big-title">
                    <img src={logo} alt="logo" />
                </h1>
                <div className="content-container">
                    <div className="title"><p>Overview</p></div>
                        <Blobs />
                        <div className="title"><p>Control Panel</p></div>
                        <div className="search-container">
                            <div className="input-outline">
                                <input 
                                    className = "search-input" 
                                    value = {searchValue} 
                                    onChange = {this.onInputChange}
                                />
                            </div>
                            <span className="search-icon">
                                <img src={slogo} alt="search" /> 
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