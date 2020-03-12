import React from 'react';
import './firstPanel.css';
import logo from '../../assets/logo.svg';
import slogo from '../../assets/search.svg';

import Blobs from '../../component/blob/blob';
import SelectedPanel from '../../component/selectedPanel/selectedPanel';
import {debounce} from '../../util/tools';
import axios from 'axios';
import { setPerson, setTopicData, setYear } from '../../actions/data';
import { setGroup, addStep } from '../../actions/step';
import { connect } from 'react-redux';
import DatePanel from '../../component/selectedPanel/datePanel';
import PathContainer from '../../component/pathContainer/PathContainer';

class FirstPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchValue: "",
            /* options：[[0,'All'],[id,data]] */
            dataSet: [
                {key:'Year', title: 'Year', options: []},
                {key:'Person', title: 'Related People', options: []},
                {key:'Dynasty', title: 'Dynasty', options: []},
                {key:'Status', title: 'Status', options: []},
                {key:'Gender', title: 'Gender', options: []}
            ],
            clickStatus: {},
            timeRange: [0,0],
            _tabPanel: 2,
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
                        dataSet[2].options = [[0,'All'],...Object.entries(res.data[dataSet[2].key])];
                        dataSet[3].options = [[0,'All'],...Object.entries(res.data[dataSet[3].key])];
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
                            if(dset.key !== 'Dynasty' && dset.key !== 'Gender') {
                                dset.options = [[0,'All'], ...Object.entries(data[dset.key])];
                            } else {
                                dset.options = [ ...Object.entries(data[dset.key])];
                            }
                        }
                        clickStatus[dset.key] = Array(dset.options.length).fill(false);
                    })
                    that.setState({
                        timeRange: [low, high],
                        dataSet,
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
        let that = this;
        let {step_ }= this.props;

        let {clickStatus, timeRange, dataSet } = this.state;
        // input[i].title = dataSet[i+1].key ~ clickStates{title}
        // index = i+1 留在这里，修改顺序后可以快点修改
        let input = [
            {title: "Person", data: "person_ids[]", index:1},
            {title: "Dynasty", data: "dynasty_ids[]", index:2},
            {title: "Status", data: "status[]", index:3},
            {title: "Gender", data: "genders[]", index:4}
        ]

        let param = new FormData();
        if(timeRange[0]!= '0' && timeRange[1]!= '0'){
            param.append('min_year', timeRange[0]);
            param.append('max_year', timeRange[1]);
        }

        for(let i = 0; i < input.length; i++) {
            let {title, data} = input[i];
            if(clickStatus[title]!==undefined) {
                if(clickStatus[title][0] && dataSet[i+1].options[0][1] === 'All') {
                    dataSet[i+1].options.forEach((k,j)=> {
                        // entries({id:name})
                        j > 0 && param.append(data, k[0])
                    })
                } else {
                    clickStatus[title].forEach((k,j) => {
                        k === true && param.append(data, dataSet[i+1].options[j][0])
                    })
                }
            }
        }

        if([...param.keys()].length === 1 && param.has('person_ids[]')) {
            axios.post('/search_topics_by_person_ids/', param)
                .then(response => {
                    if(response.data.is_success) {
                        let people= param.getAll('person_ids[]')
                        console.log("res.data",response.data);
                        that.props.setPerson(people)
                        that.props.setTopicData(response.data);
                        that.props.setGroup({[step_]: people.length })
                        that.props.addStep();
                    }
                })
        } else {
            axios.post('/search_person_by_ranges/', param)
            .then(res => {
                if(res.data.is_success) {
                    let _size = Object.entries(res.data["Person"]).length;
                    if( _size !== 0 || res.data["Person"].constructor !== Object) {
                        let that = this;
                        let {step_ }= this.props;

                        let param = new FormData();
                        // 超过1000个人好像有问题
                        let i = 0;
                        for(let _key in res.data["Person"]) {
                            i++;
                            if(i < 300) {
                                param.append("person_ids[]", _key);
                            }
                        }
                        console.log(i);
                        axios.post('/search_topics_by_person_ids/', param)
                            .then(response => {
                                if(response.data.is_success) {
                                    console.log("res.data",response.data);
                                    that.props.setPerson(res.data["Person"])
                                    that.props.setTopicData(response.data);
                                    that.props.setGroup({[step_]: _size })
                                    that.props.addStep();
                                }
                            })
                    } else {
                        alert('没有相关人');
                    }
                }
            })
            .catch(err => {
                console.error(err);
            })
        }
    }

    onClickDelete() {
        let {clickStatus, timeRange} = this.state;
        timeRange = [0,0];
        for(let key in clickStatus) {
            clickStatus[key] = Array(clickStatus[key].length).fill(false)
        }
        this.setState({clickStatus, timeRange})
    }

    onSwitchPanel(index) {
        this.setState({
            _tabPanel: index
        })
    }

    _renderPanel() {
        let { _tabPanel,searchValue, dataSet, clickStatus, timeRange } = this.state;

        const _titles = ["Person", "Condition", "Graph"];
        let $titles = (
            <div className="panel-titles">
                {
                    _titles.map((title,i) => (
                        <span key={title} className={["switch-title",i===_tabPanel?"active":""].join(" ")}
                            onClick = {() => this.onSwitchPanel(i)}
                        >{title}</span>
                    ))
                }
            </div>
        )
        switch(_tabPanel) {
            case 0:
                return (
                    <div className="switch-panel">
                        {$titles}
                        <div className="panel-content border">
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
                            {/* <SelectedPanel 
                                title={dataSet[1].title} clicked = {clickStatus[dataSet[1].key]}
                                setClicked = {this.setStatus(dataSet[1].key)} options={dataSet[1].options}
                            /> */}
                        </div>
                        </div>
                    </div>
                )
            case 1:
                return (
                    <div className="switch-panel">
                        {$titles}
                        <div className="panel-content">
                        <DatePanel 
                            title={dataSet[0].title}
                            setClicked = {this.setTimeRange}
                            range={timeRange} 
                            options = {dataSet[0].options}
                        />
                        {dataSet.map((datum, index) => {
                            if(index > 1) {
                                return (<SelectedPanel 
                                    key={`datum-${index}`} title={datum.title} clicked = {clickStatus[datum.key]}
                                    setClicked = {this.setStatus(datum.key)} options={datum.options}
                                />)
                            } else {
                                return null;
                            }
                        })}
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="switch-panel">
                        {$titles}
                        <div className="panel-content border">
                            <PathContainer />
                        </div>
                    </div>
                )
            default:
                return null;
        }
    }
    
    render() {
        return (
            <div className="first-panel">
                <h1 className="big-title">
                    <img src={logo} alt="logo" />
                </h1>
                <div className="content-container">
                    <div className="title"><p>Overview</p></div>
                        <Blobs blobs = {Object.values(this.props.group_)}/>
                    <div className="title"><p>Control Panel</p></div>
                    
                    {this._renderPanel()}

                    {/* <PathContainer /> */}
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
        step_: state.step,
        group_: state.group
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setTopicData: data => dispatch(setTopicData(data)),
        setPerson: data => dispatch(setPerson(data)),
        setRange: data => dispatch(setYear(data)),
        setGroup: data => dispatch(setGroup(data)),
        addStep: () => dispatch(addStep())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FirstPanel);