import React from 'react';
import './firstPanel.css';
import logo from '../../assets/logo.svg';
import slogo from '../../assets/search.svg';

import Blobs from '../../component/blob/blob';
import SelectedPanel from '../../component/selectedPanel/selectedPanel';
import {debounce} from '../../util/tools';
import axios from 'axios';
import { setPerson, setTopicData, setYear } from '../../actions/data';
import { connect } from 'react-redux';
import DatePanel from '../../component/selectedPanel/datePanel';

class FirstPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchValue: "",
            dataSet: [
                {key:'Year', title: 'Year', options: []},
                {key:'Person', title: 'Related Person', options: []},
                {key:'Dynasty', title: 'Dynasty', options: []},
                {key:'Status', title: 'Status', options: []},
                {key:'Gender', title: 'Gender', options: []}
            ],
            clickStatus: {},
            timeRange: [0,0]
        }

        this.onInputChange = this.onInputChange.bind(this);
        this.onClickSearch = this.onClickSearch.bind(this);
        this.setStatus = this.setStatus.bind(this);
        this.setTimeRange = this.setTimeRange.bind(this);
    }

    componentDidMount() {
        let {dataSet, clickStatus} = this.state;
        let that = this;
        axios.post('/init_ranges/')
            .then(res => {
                // console.log(res);
                    if(res.data.is_success === true) {
                        // 朝代和社会区分有初始值
                        dataSet[2].options = Object.values(res.data[dataSet[2].key]);
                        dataSet[3].options = Object.values(res.data[dataSet[3].key]);
                        clickStatus[dataSet[2].key] = Array(dataSet[2].options.length).fill(false);
                        clickStatus[dataSet[3].key] = Array(dataSet[3].options.length).fill(false);

                        that.setState({
                            dataSet,
                            clickStatus
                        })
                    }
            })
            .catch(err => {
                console.log(err);
            })
    }

    setStatus(name) {
        return index => {
            let {clickStatus} = this.state;
            clickStatus[name][index] = !clickStatus[name][index];
            this.setState({
                clickStatus
            })
        }
    }

    setTimeRange(low, high) {
        this.setState({
          timeRange: [low, high]  
        })
    }

    onInputChange(event) {
        let name = event.target.value;
        this.setState({
            searchValue: name
        })
        // debounce(() => this.fetchRange(name), 1000)();
    }

    fetchRange() {
        let that = this;
        let {searchValue, clickStatus} = this.state;

        let bdata = new FormData();
        bdata.append('name', searchValue);

        axios
            .post('/search_ranges_by_name/', bdata)
            .then(res => {
                if (res.data.is_success) {
                    let {data} = res;
                    let year = Object.values(data["Year"])
                        .sort((a,b) => a-b);
                    
                    // SECTION update dataSet
                    let {dataSet} = that.state, low, high;
                    dataSet.forEach(dset => {
                        low = +year[0];
                        high = +year.pop();
                        if(dset.key === 'Year') {
                            dset.options = [];
                            while(low <= high) {
                                dset.options.push(low);
                                low += 1;
                            }
                        } else {
                            dset.options = ['全部', ...Object.values(data[dset.key])];
                        }
                        clickStatus[dset.key] = Array(dset.options.length).fill(false);
                    })
                    that.setState({
                        timeRange: [low, high],
                        dataSet
                    })

                    let param = new FormData();
                    // param.append("person_ids", JSON.stringify(Object.keys(data["Person"])))
                    let person_ids = Object.keys(data["Person"])
                    person_ids.forEach(e => {
                        param.append("person_ids[]", e)
                    })
                    axios.post('/search_topics_by_person_ids/', param)
                        .then(res => {
                            if(res.data.is_success) {
                                that.props.setTopicData(res.data)
                            }
                            console.log(res);
                        })
                }
                
            })
            .catch((error) => console.error(error))
    }

    onClickSearch() {
        let that = this;
        let param = new FormData();
        // let {min_year, max_year, genders, status} = this.state;
        let {clickStatus, timeRange, dataSet} = this.state;
        let genders = [],  status = [];

        if(clickStatus['Gender'][0]) {
            genders = dataSet[4].options;
        } else {
            clickStatus['Gender'].forEach((e,i) =>{
                if(e===true) {
                    genders.push(dataSet[4].options[i])
                }
            })
        }

        if(clickStatus['Status'][0]) {
            status =  dataSet[3].options;
        } else {
            clickStatus['Status'].forEach((e,i) =>{
                if(e===true) {
                    status.push(dataSet[3].options[i])
                }
            })
        }

        //TODO 待修改
        param.set('dynastie' , "宋");
        param.set('min_year', timeRange[0] || null);
        param.set('max_year', timeRange[1] || null);
        param.set('genders', genders || null)
        param.set('status', status || null)

        this.props.setRange({
            low: timeRange[0],
            high: timeRange[1]
        })

        axios.post('/search_topics_by_person_ids/', param)
            .then(res => {
                if(res.data.is_success) {
                    that.props.setTopicData(res.data)
                }
                console.log(res);
            })
        // axios.post('/search_person_by_ranges/', param)
        //     .then(res => {
        //         if(res.data.is_success) {
        //             that.props.setPerson(res.data.person_ids)
                    
        //             let param = new FormData()
        //             param.set('person_ids', res.data.person_ids)

        //             axios.post('/search_topics_by_person_ids/', param)
        //                 .then(res => {
        //                     if(res.data.is_success) {
        //                         that.props.setTopicData(res.data)
        //                     }
        //                     console.log(res);
        //                 })
        //         }
        //     })
        //     .catch(err => {
        //         console.error(err);
        //     })
    }
    
    render() {
        let { searchValue, dataSet, clickStatus, timeRange } = this.state;
        return (
            <div className="first-panel">
                <h1 className="big-title">
                    <img src={logo} alt="logo" />
                </h1>
                <div className="content-container">
                    <div className="title"><p>Overview</p></div>
                        <Blobs blobs={Object.values(this.props.group).sort((a,b)=>a-b)}/>
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
                                <img src={slogo} alt="search" onClick = {()=>this.fetchRange()}/> 
                            </span>
                    </div>
                    <DatePanel 
                        title={dataSet[0].title}
                        setClicked = {this.setTimeRange}
                        range={timeRange} 
                        options = {dataSet[0].options}
                    />
                    {dataSet.map((datum, index) => {
                        if(index > 0) {
                            return (<SelectedPanel 
                                key={`datum-${index}`} title={datum.title} clicked = {clickStatus[datum.key]}
                                setClicked = {this.setStatus(datum.key)} options={datum.options}
                            />)
                        } else {
                            return null;
                        }
                    })}
                    <div className="btn-container">
                        <button className="btn" onClick={this.onClickSearch}>Search</button>
                        <button className="btn btn-delete">Delete</button>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        step: state.step,
        group: state.group
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setTopicData: data => dispatch(setTopicData(data)),
        setPerson: data => dispatch(setPerson(data)),
        setRange: data => dispatch(setYear(data))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FirstPanel);