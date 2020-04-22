import React from 'react';
import './firstPanel.css';
import 'react-virtualized/styles.css';
import slogo from '../../assets/search.svg';
import Blobs from '../../component/blob/blob';
import SelectedPanel from '../../component/selectedPanel/selectedPanel';
import axios from 'axios';
import { connect } from 'react-redux';
import DatePanel from '../../component/selectedPanel/datePanel';
import PathContainer from '../../component/pathContainer/PathContainer';
import { fetchTopicData, setOtherStep } from '../../actions/step';
import order from '../../assets/data/name.json';
import parent from '../../assets/data/parent.json'
import parent2 from '../../assets/data/parent2.json'
import Header from '../../component/header/Header';
import GroupPanel from '../../component/selectedPanel/groupPanel';

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
                { key: 'Addr', title: 'Native Place', options: []},
                { key: 'PostType', title: '任职方式', options: []},
                { key: 'post_address', title: '任职地址', options: []},
                { key: 'Office', title: '官职', options: []},
                { key: 'OfficeType', title: '官职类型', options: []},
                { key: 'Entry', title: 'Entry', options: []},
                { key: 'EntryType', title: 'EntryType', options: []},
                { key: 'Status', title: 'Status', options: [] },
                // 性别直接传文字
                { key: 'Gender', title: 'Gender', options: [{value:"男", label:'男'}, {value:"女",label:'女'}]},
            ],
            clickStatus: { 'Gender':[false,false], 'Person':[false],
                    "Dynasty":[],"Addr":[],"PostType" :[],
                    "post_address":[],"Office":[],
                    "OfficeType":[],"Entry": [],
                    "EntryType":[],"Status":[]
            },
            timeRange: [0, 0],
            _tabPanel: 0,
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
        let arr = [];

        
        if (type !== 2) {
            for (let _key in data) {
                arr.push({value: _key, label: data[_key][KEY]})
            }
        }

        if (type !== 0) {
            arr.unshift({value: 0, label: ALL_SIGN})
        }
        return arr;
    }

    componentDidMount() {
        let { dataSet, clickStatus } = this.state;
        let that = this;
        axios.post('/init_ranges/')
            .then(res => {
                if (res.data.is_success === true) {
                    dataSet.forEach((dset, index) => {
                        // 时间和性别不需要初始值
                        if(index!==0 && index !== 11) {
                            dset.options = that.tool_handleItem(res.data[dset.key], 1);
                            clickStatus[dset.key] = Array(dset.options.length).fill(false);
                        }
                    })

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
        let { KEY } = this.props;

        let bdata = new FormData();
        bdata.append('name', searchValue);

        axios
            .post('/search_relation_person_by_name/', bdata)
            .then(res => {
                if (res.data.is_success) {
                    let data = res.data["Person"][0]
                    // SECTION update dataSet
                    let { dataSet } = that.state;

                    // "Person", 有相关人的relation
                    let groups = {
                        // key: {
                        //     'title': kinkey,
                        //     'people': [
                        //         [person_id, name, relationship]
                        //     ]
                        // }
                    };

                    for(let key in data) {
                        // console.log(data[key])
                        data[key]["relation"].forEach(r => {
                            let _order = order[r["name"]];
                            if(_order === undefined) {
                                // 属于其他亲属类
                                _order = "1106"
                            }
                            let parentType = +(_order[0]+_order[1]);
                            if(groups[parentType]===undefined) {
                                groups[parentType] = {
                                    'title': parent[parentType][KEY],
                                    'group': {}
                                }
                            }
                            if(groups[parentType]['group'][_order] === undefined) {
                                groups[parentType]['group'][_order] = {
                                    'title': parent2[_order][KEY],
                                    'people': []
                                }
                            }
    
                            groups[parentType]['group'][_order]['people'].push(
                                {value: key, label: data[key][KEY], r: r[KEY]}
                            )
                        })
                    }

                    // dataSet[1].options.push({value: 0, label: ALL_SIGN})
                    let size = 0;
                    for(let key in groups) {
                        for(let inner in groups[key]['group']) {
                            groups[key]['group'][inner]['people'].sort((a, b) => {
                                return a['r'].localeCompare(b['r'])
                            })
                            dataSet[1].options.push(...groups[key]['group'][inner]['people'])
                            size += groups[key]['group'][inner]['people'].length;
                        }
                    }
           
                    dataSet[1]['groups'] =  groups;
                    clickStatus["Person"] = Array(size+1).fill(false);

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
    tool_appendParam(input_item, param, type) {
        let { clickStatus, dataSet } = this.state;
        let { title, data, index } = input_item;

        if(type === 1) {
            let persons = new Set();
            if (clickStatus[title][0] && dataSet[index].options[0]['label'] === ALL_SIGN) {
                dataSet[index].options.forEach((k, j) => {
                    // entries({id: name})
                    j > 0 && persons.add(k['value'])
                })
            } else {
                clickStatus[title].forEach((k, j) => {
                    k && persons.add(dataSet[index].options[j]['value'])
                })
            }

            for(let id of persons.values()) {
                param.append(data, id)
            }
            // console.log(persons)
        } else {
            if (clickStatus[title] !== undefined) {
                if (clickStatus[title][0] && dataSet[index].options[0]['label'] === ALL_SIGN) {
                    dataSet[index].options.forEach((k, j) => {
                        // entries({id: name})
                        j > 0 && param.append(data, k['value'])
                    })
                } else {
                    clickStatus[title].forEach((k, j) => {
                        k && param.append(data, dataSet[index].options[j]['value'])
                    })
                }
            }
        }
    }

    // 传给pathContainer
    modify_cypher = cyphers => {
        this.setState({
            cyphers
        })
    }

    addAnother(step) {
        if(step > 1) {
            sessionStorage.setItem('another', step);
            console.info('setAnother', step)
        }
    }
    onClickSearch() {
        let { KEY, groups, step, fetchTopicData, setOtherStep } = this.props;
        let { timeRange, _tabPanel } = this.state;
        // input[i].title = dataSet[i+1].key ~ clickStates{title}
        // index = i+1 留在这里，修改顺序后可以快点修改
        let input = [
            // title是key
            { title: "Person", data: "person_ids[]", index: 1 },
            { title: "Dynasty", data: "dynasty_ids[]", index: 2 },
            { title: "Addr", data: "address_ids[]", index: 3},
            { title: "PostType", data: "post_type_ids[]", index: 4},
            { title: "post_address", data: "post_address_ids[]", index: 5},
            { title: "Office", data: "office_ids[]", index: 6},
            { title: "OfficeType", data: "office_type_ids[]", index: 7},
            { title: "Entry", data: "entry_ids[]", index: 8},
            { title: "EntryType", data: "entry_type_ids[]", index: 9},
            // statu没有打错
            { title: "Status", data: "statu_ids[]", index: 10},
            { title: "Gender", data: "genders[]", index: 11},
        ]

        let param = new FormData();
        this.addAnother(step+1)
        switch (_tabPanel) {
            case 0:
                this.tool_appendParam(input[0], param, 1);
                fetchTopicData(param, KEY, step+1);

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
                                fetchTopicData(param, KEY, step+1);
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
                    fetchTopicData(_p, KEY, step+1);
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
        let { _tabPanel, searchValue, dataSet, clickStatus, timeRange, status} = this.state;

        const _titles = ["Figure", "Condition", "Graph"];
        let $titles = (
            <div className="panel-titles">
                {
                    _titles.map((title, i) => (
                        <span key={title} className={["switch-title g-text", i === _tabPanel ? "active" : ""].join(" ")}
                            onClick={() => this.onSwitchPanel(i)}
                        >{title}</span>
                    ))
                }
            </div>
        )

        let count = 1;

        switch (_tabPanel) {
            case 0:
                return (
                    <div className="switch-panel" style={{overflow: 'hidden'}}>
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
                            {
                                dataSet[1].groups && 
                                    <div className="person-dropdown-container"
                                        style={{overflow:'hidden', flex: 1}}>
                                        
                                        <div className={"person-dropdown dropdown__list-item"} 
                                            style={{minHeight: '4vh'}}
                                            onClick={() => this.setStatus('Person')(0)}
                                        >
                                            <input type="checkbox"
                                                checked={clickStatus['Person'][0]}  
                                                readOnly />
                                            <div className="item-container">
                                                Select all
                                            </div>
                                        </div>

                                        <div className="person-lists">
                                        {
                                            Object.values(dataSet[1].groups).map((group, index) => {
                                                return Object.values(group['group']).map(inner => {
                                                    return (
                                                        <GroupPanel
                                                            key={count}
                                                            title={inner['title']}
                                                            startIndex={count}
                                                            status ={clickStatus["Person"].slice(count, count += inner['people'].length)}
                                                            options={inner['people']}
                                                            change ={status}
                                                            cb={this.setStatus("Person")}
                                                        >
                                                        </GroupPanel>
                                                    )
                                                })
                                            })
                                        }
                                        </div>
                                    </div>
                            }
                            
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
                                    return (
                                        <SelectedPanel
                                            key={`datum-${index}`} title={datum.title} clicked={clickStatus[datum.key]}
                                            setClicked={this.setStatus(datum.key)} 
                                            options={datum.options}
                                        />
                                    )
                                } else {
                                    return null;
                                }
                            })}
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="switch-panel" style={{overflow: 'hidden'}}>
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
        let {showVenn} = this.props;

        return (
            <div className="first-panel">
                <Header title="CohortVA" cstyle={{textAlign: 'center', fontSize:'30px', margin:'0 auto'}} />
                <div className="content-container">
                    <div className="control-panel">
                        <div className="title"><p className="g-chart-title">Control Panel</p></div>

                        {this._renderPanel()}

                        <div className="btn-container">
                            <button className="btn" onClick={this.onClickSearch}>Search</button>
                        </div>
                    </div>

                    
                    {
                        showVenn ?
                        <div className="venn-container show-venn">
                            <p className="title g-chart-title">Venn</p>
                            <Blobs />
                        </div>
                         : 
                        <div className="venn-container vennshow">
                            <p className="title g-chart-title">Venn</p>
                        </div>
                    } 
                    
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        KEY: state.KEY,
        step: state.step,
        groups: state.groups,
        showVenn: state.vennstep.length > 0
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchTopicData: (param, key, step) => dispatch(fetchTopicData(param, key, step, 0)),
        setOtherStep: (key, step = 1)=> dispatch(setOtherStep(key, step))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FirstPanel);