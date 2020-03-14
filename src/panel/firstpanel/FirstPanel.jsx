import React from 'react';
import './firstPanel.css';
import 'react-virtualized/styles.css';
import logo from '../../assets/logo.svg';
import slogo from '../../assets/search.svg';
import List from 'react-virtualized/dist/commonjs/List';

import Blobs from '../../component/blob/blob';
import SelectedPanel from '../../component/selectedPanel/selectedPanel';
import {debounce} from '../../util/tools';
import axios from 'axios';
import { setPerson, setTopicData, setYear } from '../../actions/data';
import { setGroup, addStep } from '../../actions/step';
import { connect } from 'react-redux';
import DatePanel from '../../component/selectedPanel/datePanel';
import PathContainer from '../../component/pathContainer/PathContainer';

const ALL_SIGN = "all";
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
            _tabPanel: 1,
        }

        this.onInputChange = this.onInputChange.bind(this);
        this.onClickSearch = this.onClickSearch.bind(this);
        this.setStatus = this.setStatus.bind(this);
        this.setTimeRange = this.setTimeRange.bind(this);
        this.onClickDelete =  this.onClickDelete.bind(this);
    }

    tool_handleItem(data, type) {
        let {KEY} = this.props;
        let arr = [];

        if(type === 1) {
            arr.push([0, ALL_SIGN])
        }
        for(let _key in data) {
            arr.push([_key, data[_key][KEY]])
        }
        return arr;
    }

    async fetchTopics(param) {
        let response = await axios.post('/search_topics_by_person_ids/', param);
        let {KEY} = this.props;
        if(response.data.is_success) {
            console.log("responseData",response.data)
            // 处理node_dict and edge_dict, 将name修改一下
            let temp = {"node_dict":{}, "edge_dict":{}, "all_topics":[]};
            for(let _key in response.data["node_dict"]) {
                temp.node_dict[_key] = {
                    "name": response.data["node_dict"][_key][KEY],
                    "label": response.data["node_dict"][_key]["label"]
                }
            }
            for(let _key in response.data["edge_dict"]) {
                temp.edge_dict[_key] = {
                    "name": response.data["edge_dict"][_key][KEY],
                    "label": response.data["edge_dict"][_key]["label"] 
                }
            }

            let count = {};
            for(let _key in response.data["topic_id2sentence_id2position1d"]) {
                let _data = response.data["node_dict"][_key]
                let count_key;
                // 如果name en_name都为None: label
                if(_data["name"] === "None" && _data["en_name"] === "None") {
                    count_key =  _data["label"]
                } else if(_data[KEY] === "None") {
                    count_key = _data["name"]
                } else {
                    count_key = _data[KEY]
                }
                temp.all_topics.push([_key, count_key]);
                if(count[count_key] === undefined) {
                    count[count_key] = 1;
                } else {
                    count[count_key] += 1;
                }
            }
            temp.all_topics.sort((a,b) => count[b]-count[a])
            console.log("count",count,{...temp, ...response.data});
            return {...temp, ...response.data}
        } else {
            return null
        }
    }
    
    componentDidMount() {
        let {dataSet, clickStatus} = this.state;
        let that = this;
        axios.post('/init_ranges/')
            .then(res => {
                    if(res.data.is_success === true) {
                        // 朝代和社会区分有初始值
                        dataSet[2].options = that.tool_handleItem(res.data[dataSet[2].key],1);
                        dataSet[3].options = that.tool_handleItem(res.data[dataSet[3].key],1);
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

    // 选择框的click事件 TODO 修改调用
    setStatus(name) {
        return (index, is_all) => {
            let {clickStatus} = this.state;

            if(is_all && index === 0) {
                // 选择了"选择全部"选项
                let size = clickStatus[name].length - 1;
                clickStatus[name] = [!clickStatus[name][0], ...Array(size).fill(false)]
            } else {
                if(is_all) {
                    // 有"选择全部"选项， 但选择了其他选项
                    clickStatus[name][0] = false;
                }
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
                  
                    let year = [];
                    for(let _key in data["Year"]) {
                        if(data["Year"][_key]["name"]!=="None" 
                        && data["Year"][_key]["name"]!=="0") {
                            year.push(+data["Year"][_key]["name"]);
                        }
                    }
                    year = year.sort((a,b) => a-b)
                    // SECTION update dataSet
                    let {dataSet} = that.state, low, high;
                    dataSet.forEach(dset => {
                        if(dset.key === 'Year') {
                            dset.options = [...year];
                            if(year[0] === 0) {
                                dset.options.shift();
                            }
                            low = dset.options[0];
                            high = year.pop();
                        } else {
                            if(dset.key !== 'Dynasty' && dset.key !== 'Gender') {
                                dset.options = that.tool_handleItem(data[dset.key],1)
                            } else {
                                dset.options = that.tool_handleItem(data[dset.key],0)
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

    // appendParam:  {title: "Person", data: "person_ids[]", index:1},
    tool_appendParam(input_item, param) {
        let {clickStatus, dataSet} = this.state;
        let {title, data, index} = input_item;
        if(clickStatus[title]!==undefined) {
            if(clickStatus[title][0] && dataSet[index].options[0][1]===ALL_SIGN) {
                dataSet[index].options.forEach((k,j)=>{
                    // entries({id: name})
                    j > 0 && param.append(data, k[0])
                })
            } else {
                clickStatus[title].forEach((k,j)=> {
                    k && param.append(data, dataSet[index].options[j][0])
                })
            }        
        }
    }

    onClickSearch() {
        let that = this;
        let {step_, KEY}= this.props;
        let {timeRange, _tabPanel} = this.state;
        // input[i].title = dataSet[i+1].key ~ clickStates{title}
        // index = i+1 留在这里，修改顺序后可以快点修改
        let input = [
            {title: "Person", data: "person_ids[]", index:1},
            {title: "Dynasty", data: "dynasty_ids[]", index:2},
            {title: "Status", data: "status[]", index:3},
            {title: "Gender", data: "genders[]", index:4}
        ]

        let param = new FormData();
        switch(_tabPanel) {
            case 0:
                this.tool_appendParam(input[0],param);
                
                this.fetchTopics(param)
                    .then(topicData => {
                        console.log("fetchTopics,topicData",topicData)
                        if(topicData!==null) {
                            let people = param.getAll('person_ids[]')
                            this.props.setPerson(people)
                            this.props.setTopicData(topicData)
                            this.props.setGroup({[step_]: people.length })
                            this.props.addStep();
                        }
                    })
                    .catch(err => {
                        console.error(err)
                    })
                break;
            case 1:
                if(timeRange[0]!== 0 && timeRange[1]!== 0){
                    param.append('min_year', timeRange[0]);
                    param.append('max_year', timeRange[1]);
                }
        
                for(let i = 0; i < input.length; i++) {
                    this.tool_appendParam(input[i], param);
                }

                axios.post('/search_person_by_ranges/', param)
                    .then(res => {
                        if(res.data.is_success) {
                            let _size = Object.entries(res.data["Person"]).length;
                            if( _size !== 0 || res.data["Person"].constructor !== Object) {
                                let that = this;
                                let {step_ }= this.props;

                                let param = new FormData();
                                let i = 0;
                                let arr = [];
                                for(let _key in res.data["Person"]) {
                                    i++;
                                    if(i < 6) {
                                        param.append("person_ids[]", _key);
                                        arr.push(_key)
                                    }
                                }
                                let topicData = that.fetchRange(param);
                                if(topicData!==null) {
                                    that.props.setPerson(res.data["Person"])
                                    that.props.setTopicData(topicData);
                                    that.props.setGroup({[step_]: _size })
                                    that.props.addStep();
                                }
                            } else {
                                alert('没有相关人');
                            }
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    })
                break;
            default:
                console.log(_tabPanel);
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

    _renderRow({index, key, style}) {
        let {dataSet} = this.state;
        return (
            <div 
                key={key} value={dataSet[1].options[index][1]}
                style = {style}
                className={"dropdown__list-item"}
                onClick = {() => this.setStatus('Person')(index)}
            >
                <input type="checkbox" />
                {index === 0 ?'Selected all  ': dataSet[1].options[index][1]}
            </div>   
        )
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
                                <span className="search-icon" onClick = {()=>this.fetchRange()}>
                                    <img src={slogo} alt="search" /> 
                                </span>
                            </div>
                            {/* <SelectedPanel 
                                title={dataSet[1].title} clicked = {clickStatus[dataSet[1].key]}
                                setClicked = {this.setStatus(dataSet[1].key)} options={dataSet[1].options}
                            /> */}
                            {/* <ul className="dropdown-container"> */}
                            <List
                                width={180}
                                height={400}
                                rowHeight={30}
                                className = "dropdown-list"
                                rowRenderer={this._renderRow.bind(this)}
                                rowCount={dataSet[1].options.length} 
                            />
                            {/* {
                                dataSet[1].options.map((option, index) => (
                                    <li 
                                        key={`option-${index}`} value={option[1]}
                                        className={"dropdown__list-item"}
                                    >
                                    <input type="checkbox" />
                                        {index === 0 ?'Selected all  ': option[1]}
                                    </li> 
                                ))
                            } */}
                            {/* </ul> */}
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
        group_: state.group,
        KEY: state.KEY
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