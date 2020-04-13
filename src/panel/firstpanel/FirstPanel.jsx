import React from 'react';
import './firstPanel.css';
import 'react-virtualized/styles.css';
import logo from '../../assets/logo.svg';
import slogo from '../../assets/search.svg';
import List from 'react-virtualized/dist/commonjs/List';

import Blobs from '../../component/blob/blob';
import SelectedPanel from '../../component/selectedPanel/selectedPanel';
import axios from 'axios';
import { connect } from 'react-redux';
import DatePanel from '../../component/selectedPanel/datePanel';
import PathContainer from '../../component/pathContainer/PathContainer';
import { fetchTopicData, setOtherStep } from '../../actions/step';
import { debounce } from '../../util/tools';
// import * as order from '../../assets/data/name.json'
import Header from '../../component/header/Header';

const ALL_SIGN = "all";
class FirstPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchValue: "",
            /* options：[[0,'All'],[id,data]] */
            dataSet: [
                { key: 'Year', title: 'Year', options: [] },
                { key: 'Person', title: 'Related People', options: [] },
                { key: 'Dynasty', title: 'Dynasty', options: [] },
                { key: 'Status', title: 'Status', options: [] },
                { key: 'Addr', title: 'Native Place', options: []},
                { key: 'Gender', title: 'Gender', options: [["765", '男'], ["2635",'女']]},
            ],
            clickStatus: {'Gender':[false,false]},
            timeRange: [0, 0],
            _tabPanel: 1,
            cyphers: [],
            status: false,
        }

        this.onInputChange = this.onInputChange.bind(this);
        this.onClickSearch = this.onClickSearch.bind(this);
        this.setStatus = this.setStatus.bind(this);
        this.setTimeRange = this.setTimeRange.bind(this);
        this._renderRow = this._renderRow.bind(this);
    }

    tool_handleItem(data, type) {
        let { KEY } = this.props;
        let {searchValue} = this.state;
        let arr = [];

        
        if (type === 2) {
            // "Person", 有相关人的relation
            let entries = Object.entries(data);
                // let order = await('../../assets/data/name.json');
                // let parent = await('../../assets/data/parent.json');
                
            // entries.sort((a,b) => {
            //     let ordera = Number(order[a[1]["relation"][KEY]]);
            //     let orderb = Number(order[b[1]["relation"][KEY]]);
            //     if(ordera === orderb) {
            //         return a[1]["relation"][KEY] - b[1]['relation'][KEY]
            //     } else {
            //         return ordera - orderb
            //     }
            // })

            // entries.sort((a,b) => {
            //     return a[1]["relation"][KEY] - b[1]['relation'][KEY]
            // })
            
            
            entries.forEach(e => {
                if(e[1][KEY] === searchValue) {
                    arr.unshift([e[0], e[1][KEY], e[1]["relation"] && e[1]["relation"][KEY]])
                } else {
                    arr.push([e[0], e[1][KEY], e[1]["relation"] && e[1]["relation"][KEY]])
                }
            })
        } else {

            for (let _key in data) {
                arr.push([_key, data[_key][KEY]])
            }
        }

        if (type !== 0) {
            arr.unshift([0, ALL_SIGN])
        }
        return arr;
    }

    componentDidMount() {
        let { dataSet, clickStatus } = this.state;
        let that = this;
        axios.post('/init_ranges/')
            .then(res => {
                if (res.data.is_success === true) {
                    // 朝代 社会区分 籍贯有初始值
                    dataSet[2].options = that.tool_handleItem(res.data[dataSet[2].key], 1);
                    dataSet[3].options = that.tool_handleItem(res.data[dataSet[3].key], 1);
                    dataSet[4].options = that.tool_handleItem(res.data[dataSet[4].key], 1);

                    clickStatus[dataSet[2].key] = Array(dataSet[2].options.length).fill(false);
                    clickStatus[dataSet[3].key] = Array(dataSet[3].options.length).fill(false);
                    clickStatus[dataSet[4].key] = Array(dataSet[4].options.length).fill(false);

                    that.setState({
                        dataSet,
                        clickStatus
                    })
                } else {
                    if (res.data.bug) {
                        console.error(res.data.bug)
                    }
                }
            })
            .catch(err => {
                console.log(err);
            })
    }

    // 选择框的click事件 TODO 修改调用
    setStatus(name, is_all) {
        //现在is_all只和类别名称有关了
        if(name!=='Gender') {
            is_all = true;
        }
        return (index, status) => {
            let { clickStatus } = this.state;
            let _status;
            // 如果是Person, click, 改变onEnter时的状态
            if(status ===  undefined) {
                if (is_all && index === 0) {
                    // 选择了"选择全部"选项
                    let _last = clickStatus[name][0];
                    clickStatus[name] = new Array(clickStatus[name].length).fill(!_last);
                    _status = !_last;
                } else {
                    if (is_all) {
                        // 有"选择全部"选项， 但选择了其他选项
                        clickStatus[name][0] = false;
                    }
                    _status = clickStatus[name][index] = !clickStatus[name][index];
                }

            } else {
                if (is_all && index === 0) {
                    clickStatus[name] = new Array(clickStatus[name].length).fill(status);
                } else {
                    if (is_all && status === false) {
                        clickStatus[name][0] = false;
                    }
                    clickStatus[name][index] = status;
                }
            }

            if(name === 'Person' && _status !== undefined) {
                this.setState({
                    clickStatus,
                    status: _status
                })
            } else {
                this.setState({
                    clickStatus
                })
            }
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
        let { searchValue, clickStatus } = this.state;

        let bdata = new FormData();
        bdata.append('name', searchValue);

        axios
            .post('/search_relation_person_by_name/', bdata)
            .then(res => {
                if (res.data.is_success) {
                    let { data } = res;

                    // SECTION update dataSet
                    let { dataSet } = that.state;

                    dataSet[1].options =  that.tool_handleItem(data["Person"], 2)
                    clickStatus["Person"] = Array(dataSet[1].options.length).fill(false);

                    that.setState({
                        dataSet,
                        clickStatus
                    })

                } else {
                    if (res.data.bug) {
                        console.error(res.data.bug)
                    }
                }

            })
            .catch((error) => console.error(error))
    }

    // appendParam:  {title: "Person", data: "person_ids[]", index:1},
    tool_appendParam(input_item, param) {
        let { clickStatus, dataSet } = this.state;
        let { title, data, index } = input_item;
        if (clickStatus[title] !== undefined) {
            if (clickStatus[title][0] && dataSet[index].options[0][1] === ALL_SIGN) {
                dataSet[index].options.forEach((k, j) => {
                    // entries({id: name})
                    j > 0 && param.append(data, k[0])
                })
            } else {
                clickStatus[title].forEach((k, j) => {
                    k && param.append(data, dataSet[index].options[j][0])
                })
            }
        }
    }

    // 传给pathContainer
    modify_cypher = cyphers => {
        this.setState({
            cyphers
        })
    }

    onClickSearch() {
        let { KEY, fetchTopicData, setOtherStep } = this.props;
        let { timeRange, _tabPanel } = this.state;
        // input[i].title = dataSet[i+1].key ~ clickStates{title}
        // index = i+1 留在这里，修改顺序后可以快点修改
        let input = [
            { title: "Person", data: "person_ids[]", index: 1 },
            { title: "Dynasty", data: "dynasty_ids[]", index: 2 },
            { title: "Status", data: "status[]", index: 3 },
            { title: "Gender", data: "genders[]", index: 5 },
            { title: "Addr", data: "address_ids[]", index: 4},
        ]

        let param = new FormData();
        switch (_tabPanel) {
            case 0:
                this.tool_appendParam(input[0], param);
                fetchTopicData(param, KEY, 1);

                setOtherStep(6)
                setOtherStep(9)
                break;
            case 1:
                if (timeRange[0] !== 0 && timeRange[1] !== 0) {
                    param.append('min_year', timeRange[0]);
                    param.append('max_year', timeRange[1]);
                }

                for (let i = 0; i < input.length; i++) {
                    this.tool_appendParam(input[i], param);
                }

                axios.post('/search_person_by_ranges/', param)
                    .then(res => {
                        if (res.data.is_success) {
                            let _size = Object.entries(res.data["Person"]).length;
                            if (_size !== 0 || res.data["Person"].constructor !== Object) {
                                let param = new FormData();
                                let arr = [];
                                for (let _key in res.data["Person"]) {
                                    param.append("person_ids[]", _key);
                                    arr.push(_key)
                                }
                                fetchTopicData(param, KEY, 1);
                                for (let i = 6; i <= 10; i++) {
                                    setOtherStep(i)
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
            case 2:
                let {cyphers} = this.state;
                let _p = new FormData();

                // fetch
                Promise.all(cyphers.map(cypher => {
                    let param = new FormData();
                    param.append('draws', cypher)
                    return axios.post('/search_person_ids_by_draws/', param)
                })).then(values => {
                    values.forEach(res => {
                        if(res.data.is_success) {
                            res.data["person_ids"].forEach(id => {
                                _p.append('person_ids[]', id);
                            })
                            
                        }
                    })
                }).then(() => {
                    fetchTopicData(_p, KEY, 1);
                    setOtherStep(6);
                    setOtherStep(9);
                })
                break;
            default:
                console.log(_tabPanel);
        }
    }

    onSwitchPanel(index) {
        this.setState({
            _tabPanel: index
        })
    }

    _renderRow(name) {
        return ({index, key, style }) => {
            let { dataSet, clickStatus } = this.state;
            let $item;
            if (index === 0) {
                $item = 'Selected all  ';
            } else {
                $item = (<div className="item-container">
                    <span className="first-item">{dataSet[1].options[index][1]}</span>
                    <span>{dataSet[1].options[index][2]}</span>
                </div>)
            }
    
            return (
                <div
                    key={key} value={dataSet[1].options[index][1]}
                    style={style}
                    data-id = {index}
                    className={"person-dropdown dropdown__list-item"}
                    onClick={() => {
                        this.setStatus(name)(index)
                    }}
                    onMouseEnter = {() => {
                        let {status} = this.state;
                        this.setStatus(name)(index, status)
                    }}
                >
                    <input type="checkbox" checked={clickStatus[name][index]} readOnly />
                    {$item}
                </div>
            )
        }
    }

    _renderPanel() {
        let { _tabPanel, searchValue, dataSet, clickStatus, timeRange } = this.state;

        const _titles = ["Person", "Condition", "Graph"];
        let $titles = (
            <div className="panel-titles">
                {
                    _titles.map((title, i) => (
                        <span key={title} className={["switch-title", i === _tabPanel ? "active" : ""].join(" ")}
                            onClick={() => this.onSwitchPanel(i)}
                        >{title}</span>
                    ))
                }
            </div>
        )
        switch (_tabPanel) {
            case 0:
                return (
                    <div className="switch-panel">
                        {$titles}
                        <div className="panel-content border">
                            <div className="search-container">
                                <div className="input-outline">
                                    <input
                                        className="search-input"
                                        value={searchValue}
                                        onChange={this.onInputChange}
                                    />
                                </div>
                                <span className="search-icon" onClick={() => this.fetchRange()}>
                                    <img src={slogo} alt="search" />
                                </span>
                            </div>
                            <div style={{height: '90%', overflow: 'hidden'}}>
                                <List
                                    width={220}
                                    height={250}
                                    rowHeight={30}
                                    className="dropdown-list"
                                    rowRenderer={this._renderRow("Person")}
                                    rowCount={dataSet[1].options.length}
                                />
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
                                setClicked={this.setTimeRange}
                                range={timeRange}
                                options={dataSet[0].options}
                            />
                            {dataSet.map((datum, index) => {
                                if (index > 1) {
                                    return (<SelectedPanel
                                        key={`datum-${index}`} title={datum.title} clicked={clickStatus[datum.key]}
                                        setClicked={this.setStatus(datum.key)} 
                                        options={datum.options}
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
                            <PathContainer modify_cypher={this.modify_cypher} />
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
                {/* <h1 className="big-title">
                    CohortVA
                </h1> */}
                <Header title="CohortVA" />
                <div className="content-container">
                    <div className="title"><p>Venn</p></div>
                    <Blobs />

                    <div className="control-panel">
                        <div className="title"><p>Control Panel</p></div>

                        {this._renderPanel()}

                        <div className="btn-container">
                            <button className="btn" onClick={this.onClickSearch}>Search</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        // group_: Object.values(state.group).map(d => Object.keys(d['people']).length),
        KEY: state.KEY
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // 入口，所以只作为第一步
        fetchTopicData: (param, key) => dispatch(fetchTopicData(param, key, 1, 0)),
        setOtherStep: key => dispatch(setOtherStep(key, 1))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FirstPanel);