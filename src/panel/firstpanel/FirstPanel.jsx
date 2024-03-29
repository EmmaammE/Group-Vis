import React from 'react';
import './firstPanel.css';
import 'react-virtualized/styles.css';
import slogo from '../../assets/search.svg';
import SelectedPanel from '../../component/selectedPanel/selectedPanel';
import axios from '../../util/http';
import { connect } from 'react-redux';
import DatePanel from '../../component/selectedPanel/datePanel';
// import PathContainer from '../../component/pathContainer/PathContainer';
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
            peopleValue: "",
            /* options：[[0,'All'],[id,data]] */
            dataSet: [
                // 修改顺序需要修改init接口调用、append_param和render的地方
                { key: 'Dynasty', title: 'Dynasty', options: [] },
                { key: 'Person', title: 'Related People', options: [] },
                { key: 'Status', title: 'Status', options: [] },
                { key: 'Addr', title: 'Native Place', options: [] },
                { key: 'PostType', title: 'Holding Post', options: [] },
                { key: 'post_address', title: 'Post Address', options: [] },
                { key: 'Office', title: 'Official Position', options: [] },
                { key: 'OfficeType', title: 'Official Type', options: [] },
                { key: 'Entry', title: 'Entry', options: [] },
                { key: 'EntryType', title: 'EntryType', options: [] },
                { key: 'Year', title: 'Year', options: [] },
                // 性别直接传文字
                { key: 'Gender', title: 'Gender', options: [{ value: "男", label: '男' }, { value: "女", label: '女' }] },
            ],
            clickStatus: {
                'Gender': [false, false],
                'Person': { "0": false },
                // 人的点击状态使用对象表示， 0对应选择全部
                "Dynasty": [], "Addr": [], "PostType": [],
                "post_address": [], "Office": [],
                "OfficeType": [], "Entry": [],
                "EntryType": [], "Status": []
            },
            timeRange: [0, 0],
            _tabPanel: 0,
            cyphers: [],
            status: false,
        }

        this.$text = React.createRef();

        this.onInputChange = this.onInputChange.bind(this);
        this.onInputTextarea = this.onInputTextarea.bind(this);
        this.onClickSearch = this.onClickSearch.bind(this);
        this.setStatus = this.setStatus.bind(this);
        this.setStatusAll = this.setStatusAll.bind(this);
        this.setTimeRange = this.setTimeRange.bind(this);
        this._renderRow = this._renderRow.bind(this);
        this.setPersonStatus = this.setPersonStatus.bind(this);
        this.fetchRangeByNames = this.fetchRangeByNames.bind(this);
    }

    tool_handleItem(data, type) {
        let { KEY } = this.props;
        let arr = [];


        if (type !== 2) {
            for (let _key in data) {
                arr.push({ value: _key, label: data[_key][KEY] })
            }
        }

        if (type !== 0) {
            arr.unshift({ value: 0, label: ALL_SIGN })
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
                        // Person\Year\Gender不需要初始值
                        if (index !== 1 && index < 10) {
                            dset.options = that.tool_handleItem(res.data[dset.key], 1);
                            clickStatus[dset.key] = Array(dset.options.length).fill(false);
                        }
                    })

                    that.setState({
                        dataSet,
                        clickStatus,
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

    setStatusAll(groupKey, innerKey) {
        return () => {
            let { dataSet } = this.state;

            let status = dataSet[1].groups[groupKey]['group'][innerKey].allStatus;
            // ['allStatus'];
            dataSet[1].groups[groupKey].allStatus = !status
            // clickStatus['Person'].splice(start, count, ...Array(count).fill(!status));

            this.setState({
                // clickStatus,
                dataSet
            })
        }
    }

    // 选择框的click事件
    setStatus(name, is_all) {
        //现在is_all只和类别名称有关了
        if (name !== 'Gender') {
            is_all = true;
        }
        //!!第二个参数修改了，只有selectedPanel里的是新的
        return (index, statusArr) => {
            let { clickStatus } = this.state;
            if (is_all && index === 0) {
                // 选择了"选择全部"选项
                let _last = clickStatus[name][0];
                // 如果是部分全部
                if (statusArr !== undefined) {
                    statusArr.forEach(index => {
                        clickStatus[name][index] = !_last;
                    })
                } else {
                    clickStatus[name] = new Array(clickStatus[name].length).fill(!_last);
                }

            } else {
                if (is_all) {
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

    onInputTextarea(event) {
        let names = event.target.value;
        this.setState({
            peopleValue: names
        })
        this.$text.current.innerText = names;
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
                    let groupsArr = [];
                    let statusArr = [];
                    let { dataSet } = that.state;

                    res.data['Person'].forEach(data => {

                        // let data = Object.values(datap)[0];
                        if (Object.keys(data).length > 1) {
                            let _status = { '0': false };

                            // "Person", 有相关人的relation
                            let groups = {
                                // key: {
                                //     'title': kinkey,
                                //     'people': [
                                //         [person_id, name, relationship]
                                //     ]
                                // }
                            };

                            for (let key in data) {
                                // console.log(data[key])
                                data[key]["relation"].forEach(r => {
                                    let _order = order[r["name"]];
                                    if (_order === undefined) {
                                        // 属于其他亲属类
                                        _order = "1106"
                                    }
                                    let parentType = +(_order[0] + _order[1]);
                                    if (groups[parentType] === undefined) {
                                        groups[parentType] = {
                                            'title': parent[parentType][KEY],
                                            'group': {}
                                        }
                                    }
                                    if (groups[parentType]['group'][_order] === undefined) {
                                        groups[parentType]['group'][_order] = {
                                            'title': parent2[_order][KEY],
                                            'people': [],
                                            'allStatus': false
                                        }
                                    }

                                    let op = { value: key, label: data[key][KEY], r: r[KEY] };
                                    if (r['address']) { op['address'] = r['address'][KEY]; }
                                    if (r['dynasty']) { op['dynasty'] = r['dynasty'][KEY]; }
                                    if (r['status']) { op['status'] = r['status'].map(e => e[KEY]) }

                                    groups[parentType]['group'][_order]['people'].push(op)

                                    _status[key] = false;
                                })
                            }

                            statusArr.push(_status)
                            // console.log(clickStatus['Person'])
                            // dataSet[1].options.push({value: 0, label: ALL_SIGN})
                            // let size = 0;
                            for (let key in groups) {
                                for (let inner in groups[key]['group']) {
                                    groups[key]['group'][inner]['people'].sort((a, b) => {
                                        return a['r'].localeCompare(b['r'])
                                    })
                                    // dataSet[1].options.push(...groups[key]['group'][inner]['people'])
                                    // size += groups[key]['group'][inner]['people'].length;
                                }
                            }

                            groupsArr.push(groups)
                        }
                    })

                    dataSet[1]['groups'] = groupsArr;
                    clickStatus['Person'] = statusArr;
                    // console.log(statusArr)

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

    tool_appendPerson(param) {
        try {
            let { clickStatus } = this.state;
            clickStatus['Person'].forEach((person, index) => {
                let flag = person["0"];

                for (let key in person) {
                    if (key !== '0') {
                        if (person[key] === true || flag) {
                            param.append('person_ids[]', key)
                        }
                    }
                }
            })
        } catch (err) {
            console.log(err)
        }

    }

    // appendParam:  {title: "Person", data: "person_ids[]", index:1},
    tool_appendParam(input_item, param, type) {
        let { clickStatus, dataSet } = this.state;
        let { title, data, index } = input_item;

        if (type === 1) {
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

            for (let id of persons.values()) {
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
        if (step > 1) {
            sessionStorage.setItem('another', step);
            console.info('setAnother', step)
        }
    }

    async onClickSearch() {
        let { KEY, groups, step, fetchTopicData, setOtherStep } = this.props;
        let { timeRange, _tabPanel } = this.state;
        // input[i].title = dataSet[i+1].key ~ clickStates{title}
        // index = i+1 留在这里，修改顺序后可以快点修改
        let input = [
            // title是key
            // { title: "Person", data: "person_ids[]", index: 1 },
            { title: "Dynasty", data: "dynasty_ids[]", index: 0 },
            { title: "Addr", data: "address_ids[]", index: 3 },
            { title: "PostType", data: "post_type_ids[]", index: 4 },
            { title: "post_address", data: "post_address_ids[]", index: 5 },
            { title: "Office", data: "office_ids[]", index: 6 },
            { title: "OfficeType", data: "office_type_ids[]", index: 7 },
            { title: "Entry", data: "entry_ids[]", index: 8 },
            { title: "EntryType", data: "entry_type_ids[]", index: 9 },
            // statu没有打错
            { title: "Status", data: "statu_ids[]", index: 2 },
            { title: "Gender", data: "genders[]", index: 11 },
        ]

        let param = new FormData();
        this.addAnother(step + 1)
        switch (_tabPanel) {
            case 0:
            case 2:
                this.tool_appendPerson(param);
                fetchTopicData(param, KEY, step + 1).then(() => {
                    setOtherStep(6, step + 1)
                    setOtherStep(9, step + 1)
                });

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
                                fetchTopicData(param, KEY, step + 1);
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
            // case 2:
            // let { cyphers } = this.state;
            // let _p = new FormData();

            // // fetch
            // Promise.all(cyphers.map(cypher => {
            //     let param = new FormData();
            //     param.append('draws', cypher)
            //     return axios.post('/search_person_ids_by_draws/', param)
            // })).then(values => {
            //     values.forEach(res => {
            //         if (res.data.is_success) {
            //             res.data["person_ids"].forEach(id => {
            //                 _p.append('person_ids[]', id);
            //             })

            //         }
            //     })
            // }).then(() => {
            //     fetchTopicData(_p, KEY, step + 1);
            //     setOtherStep(6);
            //     setOtherStep(9);
            // })

            // break;
            default:
                console.log(_tabPanel);
        }
    }

    // 根据一系列人名查询相关的人
    async fetchRangeByNames() {
        let { peopleValue, dataSet, clickStatus } = this.state;
        if (peopleValue.length !== 0) {
            // 将中文逗号替换为英文
            let names = peopleValue.replace(/，/ig, ',').replace(/\s+/g, "").split(',')

            let groupsArr = [];
            let statusArr = [];
            let { KEY } = this.props;

            const starterPromise = Promise.resolve(null);

            // const log = result => console.log(result);
            await names.reduce(
                (p, spec) => p.then(() => {
                    let param = new FormData();
                    param.append('name', spec);
                    return axios.post('/search_relation_person_by_name/', param)
                }).then(res => {
                    res.data['Person'].forEach(data => {

                        // let data = Object.values(datap)[0];
                        if (Object.keys(data).length > 1) {
                            let _status = { '0': false };

                            // "Person", 有相关人的relation
                            let groups = {};

                            for (let key in data) {
                                // console.log(data[key])
                                data[key]["relation"].forEach(r => {
                                    let _order = order[r["name"]];
                                    if (_order === undefined) {
                                        // 属于其他亲属类
                                        _order = "1106"
                                    }
                                    let parentType = +(_order[0] + _order[1]);
                                    if (groups[parentType] === undefined) {
                                        groups[parentType] = {
                                            'title': parent[parentType][KEY],
                                            'group': {}
                                        }
                                    }
                                    if (groups[parentType]['group'][_order] === undefined) {
                                        groups[parentType]['group'][_order] = {
                                            'title': parent2[_order][KEY],
                                            'people': [],
                                            'allStatus': false
                                        }
                                    }

                                    let op = { value: key, label: data[key][KEY], r: r[KEY] };
                                    if (r['address']) { op['address'] = r['address'][KEY]; }
                                    if (r['dynasty']) { op['dynasty'] = r['dynasty'][KEY]; }
                                    if (r['status']) { op['status'] = r['status'].map(e => e[KEY]) }

                                    groups[parentType]['group'][_order]['people'].push(op)

                                    _status[key] = false;
                                })
                            }

                            statusArr.push(_status)

                            for (let key in groups) {
                                for (let inner in groups[key]['group']) {
                                    groups[key]['group'][inner]['people'].sort((a, b) => {
                                        return a['r'].localeCompare(b['r'])
                                    })
                                }
                            }

                            groupsArr.push(groups)
                        }
                    })

                }),
                starterPromise
            );

            dataSet[1]['groups'] = groupsArr;
            clickStatus['Person'] = statusArr;
            // console.log(statusArr)

            this.setState({
                dataSet,
                clickStatus
            })
        }
    }

    onSwitchPanel(index) {
        if (index !== 1) {
            let { dataSet, clickStatus } = this.state;
            dataSet[1] = { key: 'Person', title: 'Related People', options: [] };
            clickStatus['Person'] = { '0': false };
            this.setState({
                _tabPanel: index,
                dataSet,
                clickStatus
            })
        } else {
            this.setState({
                _tabPanel: index
            })
        }
    }

    _renderRow(name) {
        return ({ index, key, style }) => {
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
                    data-id={index}
                    className={"person-dropdown dropdown__list-item"}
                    onClick={() => {
                        this.setStatus(name)(index)
                    }}
                    onMouseEnter={() => {
                        let { status } = this.state;
                        this.setStatus(name)(index, status)
                    }}
                >
                    <input type="checkbox" checked={clickStatus[name][index]} readOnly />
                    {$item}
                </div>
            )
        }
    }

    setPersonStatus(groupIndex) {
        return (personsId, _status) => {
            let { clickStatus } = this.state;
            let status;
            if (_status !== undefined) {
                if (personsId === 0) {
                    for (let key in clickStatus['Person'][groupIndex]) {
                        status = clickStatus['Person'][groupIndex][key] = _status;
                    }
                } else {
                    personsId.forEach(id => {
                        status = clickStatus['Person'][groupIndex][id] = _status;
                    })
                }
            } else {
                if (personsId === 0) {
                    for (let key in clickStatus['Person'][groupIndex]) {
                        status = clickStatus['Person'][groupIndex][key] = !clickStatus['Person'][groupIndex][key];
                    }
                } else {
                    personsId.forEach(id => {
                        status = clickStatus['Person'][groupIndex][id] = !clickStatus['Person'][groupIndex][id]
                    })
                }
            }

            this.setState({
                clickStatus,
                status
            })
        }
    }

    _renderPanel() {
        let { _tabPanel, searchValue, dataSet, clickStatus, timeRange, status, peopleValue } = this.state;

        // const _titles = ["Figure", "Condition", "Graph"];
        const _titles = ["Figure", "Condition", "Figures"];
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

        switch (_tabPanel) {
            case 0:
                return (
                    <div className="switch-panel" style={{ overflow: 'hidden' }}>
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
                                dataSet[1].groups && dataSet[1].groups.map((group, statusIndex) => {

                                    let myself = group["0"]['group']["0000"]['people'][0];
                                    let cb = this.setPersonStatus(statusIndex);
                                    return (
                                        <div className="person-dropdown-container"
                                            key={'person-' + statusIndex}
                                            style={{ overflow: 'hidden', flex: 1 }}>

                                            <div className={"person-dropdown dropdown__list-item"}
                                                style={{ minHeight: '3.6rem' }}
                                            >
                                                <input type="checkbox"
                                                    checked={clickStatus['Person'][statusIndex][0]}
                                                    onChange={(event) => cb(0, event.target.checked)}
                                                />
                                                <div className="item-container">
                                                    {this.props.KEY === 'en_name' ? 'Select all' : '选择全部'}
                                                </div>
                                            </div>

                                            <div className={"person-dropdown dropdown__list-item"}
                                                style={{ minHeight: '3.6rem' }}
                                                onClick={() => cb([myself['value']])}
                                            >
                                                <input type="checkbox"
                                                    checked={clickStatus['Person'][statusIndex][myself['value']]}
                                                    readOnly />
                                                <div className="two-column" style={{ width: '100%' }}>
                                                    <span>{myself['label']}</span>
                                                    <span>{myself['r']}</span>
                                                </div>
                                            </div>
                                            {myself['address'] && <div className="person-info two-column">
                                                {/* <span className="first-item">Native Place</span> */}
                                                <span>{this.props.KEY === 'en_name' ? 'Address: ' : '地址：'}</span>
                                                <span>{myself['address']}</span>
                                            </div>}
                                            {myself['dynasty'] && <div className="person-info two-column">
                                                <span>{this.props.KEY === 'en_name' ? 'Dynasty: ' : '朝代：'} </span>
                                                <span>{myself['dynasty']}</span>
                                            </div>}
                                            {myself['status'] && <div className="person-info two-column">
                                                {/* <span className="first-item">Status</span> */}
                                                <span>{this.props.KEY === 'en_name' ? 'Status: ' : '社会身份：'} </span>
                                                <span>{myself['status'].slice(0, 1).join(',')}</span>
                                            </div>}

                                            <div className="person-lists">
                                                {
                                                    Object.keys(group).map((groupKey, index) => {
                                                        if (groupKey !== "0") {
                                                            let _group = group[groupKey];
                                                            return Object.keys(_group['group']).map(innerKey => {
                                                                let inner = _group['group'][innerKey];
                                                                return (
                                                                    <GroupPanel
                                                                        key={'g-' + groupKey + innerKey}
                                                                        title={inner['title']}
                                                                        // startIndex={count}
                                                                        status={clickStatus['Person'][statusIndex]}
                                                                        options={inner['people']}
                                                                        change={status}
                                                                        cb={cb}
                                                                        allStatus={inner['allStatus']}
                                                                    // cb_all = {this.setStatusAll(groupKey, innerKey)}
                                                                    >
                                                                    </GroupPanel>
                                                                )
                                                            })
                                                        }
                                                        return null;
                                                    })
                                                }
                                            </div>
                                        </div>
                                    )
                                })

                            }

                        </div>
                    </div>
                )
            case 1:
                return (
                    <div className="switch-panel">
                        {$titles}
                        <div className="panel-content">
                            {dataSet.map((datum, index) => {
                                if (index === 1 || index === 7) {
                                    // OfficeType没有英文
                                    return null;
                                }

                                if (index !== 10) {
                                    return (
                                        <SelectedPanel
                                            key={`datum-${index}`} title={datum.title} clicked={clickStatus[datum.key]}
                                            setClicked={this.setStatus(datum.key)}
                                            options={datum.options}
                                        />
                                    )
                                } else {
                                    return (
                                        <DatePanel
                                            title={dataSet[index].title}
                                            setClicked={this.setTimeRange}
                                            range={timeRange}
                                        // options={dataSet[index].options}
                                        />
                                    )
                                }
                            })}
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="switch-panel" style={{ overflow: 'hidden' }}>
                        {$titles}
                        <div className="panel-content border">
                            {/* <PathContainer modify_cypher={this.modify_cypher} /> */}
                            <div className="textarea-container">
                                <span id="text" className="text font-style"
                                    // value = {peopleValue}
                                    ref={this.$text}
                                ></span>
                                <textarea id="textarea" className="textarea font-style"
                                    onChange={this.onInputTextarea}
                                ></textarea>
                                <div className='icon-container'>
                                    <span className="search-icon" onClick={this.fetchRangeByNames}>
                                        <img src={slogo} alt="search" />
                                    </span>
                                </div>
                            </div>

                            <div className="person-lists">
                                {
                                    dataSet[1].groups && dataSet[1].groups.map((group, statusIndex) => {

                                        let myself = group["0"]['group']["0000"]['people'][0];
                                        let cb = this.setPersonStatus(statusIndex);
                                        return (
                                            <div className="person-dropdown-container"
                                                key={'person-' + statusIndex}
                                                style={{ overflow: 'hidden', flex: 1 }}>

                                                <div className={"person-dropdown dropdown__list-item"}
                                                    style={{ minHeight: '3.6rem' }}
                                                >
                                                    <input type="checkbox"
                                                        checked={clickStatus['Person'][statusIndex][0]}
                                                        onChange={(event) => cb(0, event.target.checked)}
                                                    />
                                                    <div className="item-container">
                                                        {this.props.KEY === 'en_name' ? 'Select all' : '选择全部'}
                                                    </div>
                                                </div>

                                                <div className={"person-dropdown dropdown__list-item"}
                                                    style={{ minHeight: '3.6rem' }}
                                                    onClick={() => cb([myself['value']])}
                                                >
                                                    <input type="checkbox"
                                                        checked={clickStatus['Person'][statusIndex][myself['value']]}
                                                        readOnly />
                                                    <div className="two-column" style={{ width: '100%' }}>
                                                        <span>{myself['label']}</span>
                                                        <span>{myself['r']}</span>
                                                    </div>
                                                </div>
                                                {myself['address'] && <div className="person-info two-column">
                                                    {/* <span className="first-item">Native Place</span> */}
                                                    <span>{this.props.KEY === 'en_name' ? 'Address: ' : '地址：'}</span>
                                                    <span>{myself['address']}</span>
                                                </div>}
                                                {myself['dynasty'] && <div className="person-info two-column">
                                                    <span>{this.props.KEY === 'en_name' ? 'Dynasty: ' : '朝代：'} </span>
                                                    <span>{myself['dynasty']}</span>
                                                </div>}
                                                {myself['status'] && <div className="person-info two-column">
                                                    {/* <span className="first-item">Status</span> */}
                                                    <span>{this.props.KEY === 'en_name' ? 'Status: ' : '社会身份：'} </span>
                                                    <span>{myself['status'].slice(0, 1).join(',')}</span>
                                                </div>}

                                                <div className="person-lists">
                                                    {
                                                        Object.keys(group).map((groupKey, index) => {
                                                            if (groupKey !== "0") {
                                                                let _group = group[groupKey];
                                                                return Object.keys(_group['group']).map(innerKey => {
                                                                    let inner = _group['group'][innerKey];
                                                                    return (
                                                                        <GroupPanel
                                                                            key={'g-' + groupKey + innerKey + index}
                                                                            title={inner['title']}
                                                                            // startIndex={count}
                                                                            status={clickStatus['Person'][statusIndex]}
                                                                            options={inner['people']}
                                                                            change={status}
                                                                            cb={cb}
                                                                            allStatus={inner['allStatus']}
                                                                        // cb_all = {this.setStatusAll(groupKey, innerKey)}
                                                                        >
                                                                        </GroupPanel>
                                                                    )
                                                                })
                                                            }
                                                            return null;
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
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
                <Header title="CohortVA" cstyle={{ textAlign: 'center', fontSize: '3rem', margin: '0 auto', letterSpacing: 0 }} />
                <div className="content-container">
                    <div className="control-panel">
                        <div><p className="g-chart-title">Figure Searcher</p></div>

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
        KEY: state.KEY,
        step: state.step,
        groups: state.groups,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        fetchTopicData: (param, key, step, type = 0) => dispatch(fetchTopicData(param, key, step, type)),
        setOtherStep: (key, step = 1) => dispatch(setOtherStep(key, step))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FirstPanel);