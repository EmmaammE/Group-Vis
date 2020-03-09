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
        this.onClickDelete =  this.onClickDelete.bind(this);
    }

    componentDidMount() {
        let {dataSet, clickStatus} = this.state;
        let that = this;
        axios.post('/init_ranges/')
            .then(res => {
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
                    } else {
                        if(res.data.bug) {
                            console.error(res.data.bug)
                        }
                    }
            })
            .catch(err => {
                console.log(err);
            })
    }

    // 选择框的click事件
    setStatus(name) {
        return index => {
            let {clickStatus} = this.state;
            if(index === 0) {
                let size = clickStatus[name].length - 1;
                clickStatus[name] = [!clickStatus[name][0], ...Array(size).fill(false)]
            } else {
                clickStatus[name][0] = false;
                clickStatus[name][index] = !clickStatus[name][index];
            }
            this.setState({
                clickStatus
            })
        }
    }

    // 选择时间
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
        let allPerson; // 存储所有相关人的person_id

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
                        if(dset.key === 'Year') {
                            dset.options = [...year];
                            if(year[0] === '0') {
                                dset.options.shift();
                            }
                            low = dset.options[0];
                            high = year.pop();
                        } else {
                            if(dset.key === 'Person') {
                                allPerson = Object.keys(data[dset.key])
                            }
                            if(dset.key !== 'Dynasty' && dset.key !== 'Gender') {
                                dset.options = ['All', ...Object.values(data[dset.key])];
                            } else {
                                dset.options = [ ...Object.values(data[dset.key])];
                            }
                        }
                        clickStatus[dset.key] = Array(dset.options.length).fill(false);
                    })
                    that.setState({
                        timeRange: [low, high],
                        dataSet,
                        allPerson,
                        clickStatus
                    })

                } else {
                    if(res.data.bug) {
                        console.error(res.data.bug)
                    }
                }
                
            })
            .catch((error) => console.error(error))
    }

    onClickSearch() {
        // TODO 只根据朝代查询相关人信息
        let that = this;
        let param = new FormData();

        let {clickStatus, timeRange, dataSet, allPerson} = this.state;
        let input = [
            {title: "Person", data: "person_ids[]", index:1},
            {title: "Status", data: "status[]", index:3},
            {title: "Gender", data: "genders[]", index:4}
        ]
        if(timeRange[0]!= '0' && timeRange[1]!= '0'){
            param.append('min_year', timeRange[0]);
            param.append('max_year', timeRange[1]);
        }
        input.forEach(e => {
            if(clickStatus[e.title][0]) {
                if(e.title === 'Person') {
                    allPerson.forEach(e=>{
                        param.append("person_ids[]",e)
                    })
                } else {
                    dataSet[e.index].options.forEach((k,i)=> {
                        if(i>0) param.append(e.data, k)
                    })
                }
            } else {
                clickStatus[e.title].forEach((k,i) => {
                    if(k === true) {
                        param.append(e.data, dataSet[e.index].options[i])
                    }
                })
            }
        })
       
        this.props.setRange({
            low: timeRange[0],
            high: timeRange[1]
        })
        axios.post('/filter_person_by_ranges/', param)
            .then(res => {
                if(res.data.is_success) {
                    that.props.setPerson(res.data.person_ids)
                    
                    let param = new FormData()
                    res.data.person_ids.forEach(e => {
                        param.append("person_ids[]", e)
                    })

                    axios.post('/search_topics_by_person_ids/', param)
                        .then(res => {
                            if(res.data.is_success) {
                                that.props.setTopicData(res.data)
                            }
                        })
                }
            })
            .catch(err => {
                console.error(err);
            })
    }

    onClickDelete() {
        let {clickStatus, timeRange} = this.state;
        timeRange = [0,0];
        for(let key in clickStatus) {
            clickStatus[key] = Array(clickStatus[key].length).fill(false)
        }
        this.setState({clickStatus, timeRange})
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
                        <button className="btn btn-delete" onClick={this.onClickDelete}>Delete</button>
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