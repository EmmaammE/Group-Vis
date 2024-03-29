import React, { useState } from 'react';
import * as d3 from 'd3';
import './path.css'
import { PathHistory } from './pathHistory';
import { debounce } from '../../util/tools';
import { Rect, RectContainer } from './rect';

const RECT_WIDTH = 35;
const RECT_HEIGHT = 15;

let temp_rects = ['Who', 'Input']
    .map((e, i) => [(RECT_WIDTH * 2 + 10) * i + 10, RECT_HEIGHT, e]);

function Link({link}) {
    const [value, setValue] = useState('');

    function onInput(e) {
        setValue(e.target.value.trim())
    }
    return (
        <g>
            <path stroke="#aaa" fill="transparent"
                d={`M${link.source[0]},${link.source[1]} L${link.target[0]},${link.target[1]}`}
                strokeDasharray="5"
                markerEnd='url(#marker-circle)' markerStart="url(#marker-circle)"
            />
            <foreignObject 
                x={(link.source[0]+link.target[0])/2 - 25} y={(link.source[1]+link.target[1])/2} 
                width="120px" height={4 * RECT_HEIGHT + 10}>
                <div>
                    <input className="link-input" type="text" placeholder="name:"
                        value={value} onChange={onInput} />
                </div>
            </foreignObject>
        </g>
    )
}

class PathContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rects: [],
            links: [],
            // 矩形绑定的链接
            rects_links: {},
            pathHistory: new PathHistory(),

            _created: -1,
            // 上一次创建时的x坐标
            _x: 0,
            d: '',
            // rect的类型
            who: [],
            // rect -> parent who's index
            whoIndex: {},
        }
        // 供拖拽的节点label种类
        this.$container = React.createRef();

        this.rectDownFactory = this.rectDownFactory.bind(this);
        this.cbDownFactory = this.cbDownFactory.bind(this);
        this.rectModifyLabel = this.rectModifyLabel.bind(this);
        this._onClickRedo = this._onClickRedo.bind(this);
        this._onClickUndo = this._onClickUndo.bind(this);
    }

    // componentDidMount() {
    //     let node = this.$container.current;
    //     d3.select(node)
    //         .call(d3.zoom()
    //             .on("zoom", function () {
    //                 debounce(transform => {
    //                     d3.select(node)
    //                         .attr("transform", transform)
    //                 }, 100)(d3.event.transform)
    //             }))
    // }

    // componentWillMount() {
    //     d3.select(this.$container.current)
    //         .on("zoom", null)
    // }

    // NOTE 目前是将节点绑定在who上的，可能要改成边绑定
    componentDidUpdate(prevProps, prevState) {
        let { links, rects, whoIndex, rects_links } = this.state;
        try {
            if (prevState.links.length !== links.length) {
                let rectsSet = {};
                for(let key in whoIndex) {
                    let p = whoIndex[key];
                    if(rectsSet[p] === undefined) {
                        rectsSet[p] = new Set();
                    }
                    // 矩形绑定的连接
                    rects_links[key].forEach(link => {
                        rectsSet[p].add(link["link"])
                    })
                }
                
                let cyphers = Object.values(rectsSet).map(_links => {
                    let cypher = "";
                    /**
                        MATCH (p:Person)-[]-({name:'男'})
                        MATCH (:Person{name:'王安石'})-[:Do]-(m)
                        MATCH (m)-[]-({name:'是Y的恩主'}) 
                        return distinct p
                     */
                    _links.forEach(_index => {
                        let link = links[_index];
                        let l1 = rects[link["index"][0]][2],
                            l2 = rects[link["index"][1]][2];
                        
                        cypher +=  ` MATCH ${this.tool_appendCypher(link["index"][0],l1)} -[]- ${this.tool_appendCypher(link["index"][1],l2)}`
                    })
        
                    cypher += ` return distinct id(n)`;
    
                    return cypher;
                })
    
                this.props.modify_cypher(cyphers);
            }
        } catch(err){
            console.info('因为撤销连接,rects_links可能不对应, 等下次更新link即可')
            // TODO 如果就是多画了一条要撤销。。。
        }
    }

    tool_appendCypher(index, label) {
        switch (label) {
            case "Who":
                return `(n:Person)`
            case "Event":
                return `(${'r'+index})`
            default:
                return `({name:'${label}'})`
        }
    }

    // 返回修改rect位置的函数
    rectFactory(index) {
        return () => {
            let { rects, links, rects_links } = this.state;
            rects[index] = [
                rects[index][0] + d3.event.dx,
                rects[index][1] + d3.event.dy,
                rects[index][2]]

            if (rects_links[index] !== undefined) {
                // 该矩形绑定了link
                rects_links[index].forEach(_link => {
                    let link = links[_link["link"]];
                    let link_points = link[_link["key"]];

                    links[_link["link"]] = {
                        ...link,
                        ...{[_link["key"]]: [link_points[0] + d3.event.dx, link_points[1] + d3.event.dy]}
                    }
                })

                this.setState({
                    rects,
                    links
                })
            } else {
                this.setState({
                    rects
                })
            }

        }
    }

    // 返回rect拖拽完成的函数
    rectDownFactory() {
        let { rects, links, rects_links, pathHistory } = this.state;
        pathHistory.add(rects, links, rects_links);

        this.setState({
            pathHistory,
            _created: -1
        })
    }

    // 修改label
    rectModifyLabel(index) {
        return label => {
            let {rects} = this.state;
            rects[index][2] = label;
            this.setState({
                rects
            })
        }
    }
    // 返回绘制link时的函数
    linkFactory(index) {
        return () => {
            let source_x = this.state.rects[index][0] + RECT_WIDTH;
            let source_y = this.state.rects[index][1] + RECT_HEIGHT;
            // console.log(d3.event);
            this.setState({
                d: `M${source_x},${source_y}L${d3.event.x},${d3.event.y}`
            })
        }
    }

    // 返回link绘制完成时的函数
    cbDownFactory(event) {
        let { rects, links, pathHistory, rects_links, whoIndex, who } = this.state;
        // 检测link是否落在rect上
        let flag = -1;
        let x2 = event.x, y2 = event.y;
        for (let i = 0; i < rects.length; i++) {
            if (x2 >= rects[i][0] && x2 <= rects[i][0] + 2 * RECT_WIDTH
                && y2 >= rects[i][1] && y2 <= rects[i][1] + 2 * RECT_HEIGHT) {
                flag = i;
                break;
            }
        }

        let { x, y, index } = event.subject;
        if (flag === -1 || index === flag) {
            this.setState({ d: '' })

        } else {
            // index: source flag: end
            let { source_x, source_y, target_x, target_y } =
                this.tool_createLink(x, y, rects[flag][0], rects[flag][1])

            if (rects_links[index] === undefined) {
                rects_links[index] = [{ key: "source", link: links.length, other: flag }]
            } else {
                rects_links[index].push({ key: "source", link: links.length, other: flag })
            }
            if (rects_links[flag] === undefined) {
                rects_links[flag] = [{ key: "target", link: links.length, other: index }];
            } else {
                rects_links[flag].push({ key: "target", link: links.length, other: index })
            }

            let _parent;
            // 将link连接的矩形加入who节点的集合
            if(who.indexOf(index)!== -1) {
                _parent = index;
            } else if(who.indexOf(flag)!==-1) {
               _parent = flag
            } else {
                if(whoIndex[index] && whoIndex[flag]) {
                    _parent = whoIndex[index] < whoIndex[flag] ? whoIndex[index] : whoIndex[flag]
                } else {
                    _parent = whoIndex[index] || whoIndex[flag];
                    if(_parent === undefined) {
                        _parent = index < flag ? index : flag;
                    }
                }
            }
            for(let key in whoIndex) {
                if(whoIndex[key] === whoIndex[index] || whoIndex[key] === whoIndex[flag]) {
                    whoIndex[key] = _parent
                }
            }
            whoIndex[index] = whoIndex[flag] = _parent;
            
            links = [...links, {
                source: [source_x, source_y],
                target: [target_x, target_y],
                index: [index, flag]
            }]

            pathHistory.add(rects, links, rects_links)

            this.setState({
                d: '',
                links,
                pathHistory,
                whoIndex
            })
        }
    }

    tool_createLink(x, y, flagx, flagy) {
        // 美化连接（未考虑冲突）
        let source_x, source_y, target_x, target_y;

        if (Math.abs(y - flagy - RECT_HEIGHT) <= 4 * RECT_HEIGHT) {
            // 如果连接的终点和起点近乎一条水平线
            source_y = y;
            target_y = flagy + RECT_HEIGHT;
            if (x + RECT_WIDTH < flagx) {
                // 起点在左边
                source_x = x + RECT_WIDTH;
                target_x = flagx;
            } else {
                source_x = x - RECT_WIDTH
                target_x = flagx + 2 * RECT_WIDTH;
            }

        } else if (y + RECT_HEIGHT < flagy) {
            // 起点在上面
            source_y = y + RECT_HEIGHT;
            target_y = flagy;
        } else {
            // 起点在下面
            source_y = y - RECT_HEIGHT;
            target_y = flagy + 2 * RECT_HEIGHT;
        }

        if (source_x === undefined) {
            source_x = x;
            target_x = flagx + RECT_WIDTH;
        }

        return {
            source_x,
            source_y,
            target_x,
            target_y
        }
    }

    _handleRectOver(index) {
        let { _created, rects, _x, who } = this.state;
        if (_created === -1 || index !== _created) {
            if (index !== _created) {
                // 有rect没有移动
                if (rects.length > 1 && rects[rects.length - 1][0] === _x
                    && rects[rects.length - 1][1] === temp_rects[index][1]) {
                    // console.log('clear');
                    rects.pop();
                }
            }
            let this_x = temp_rects[index][0];
            if(index === 0) {
                // 保存"who"类型节点的序号
                who.push(rects.length);
            }
            rects.push([
                temp_rects[index][0],
                temp_rects[index][1],
                temp_rects[index][2]
            ])
            
            this.setState({
                _created: index,
                _x: this_x,
                rects,
                who
            })
        }
    }

    _onClickRedo() {
        let { pathHistory } = this.state;
        pathHistory.redo();
        this.setState({
            pathHistory,
            rects: pathHistory.present.rects.slice(0),
            links: pathHistory.present.links.slice(0),
            rects_links: { ...pathHistory.present.rects_links }
        })
    }

    _onClickUndo() {
        let { pathHistory } = this.state;
        pathHistory.undo();
        this.setState({
            pathHistory,
            rects: pathHistory.present.rects.slice(0),
            links: pathHistory.present.links.slice(0),
            rects_links: { ...pathHistory.present.rects_links }
        })
    }

    render() {
        let { rects, links, d } = this.state

        return (
            <div>
                <svg width="100%" height="100%" viewBox="0 0 300 650"
                    xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <marker id="marker-circle" markerWidth="10" markerHeight="10" refX="5" refY="5">
                            <circle cx="5" cy="5" r={4} stroke="#aaa" fill="transparent" />
                        </marker>
                    </defs>

                    <foreignObject x="180" y="20" width="100px" height="50px">
                        <div xmlns="http://www.w3.org/1999/xhtml" style={{ display: 'flex' }}>
                            <button onClick={this._onClickUndo}>Undo</button>
                            <button onClick={this._onClickRedo}>Redo</button>
                        </div>
                    </foreignObject>

                    <g>
                        {
                            temp_rects.map((rect, i) => (
                                <Rect key={'temp-' + i} x={rect[0]} y={rect[1]} label={rect[2]}
                                    cb_over={() => this._handleRectOver(i)}
                                />
                            ))
                        }
                    </g>


                    <g ref={this.$container}>
                        <g> {
                            rects.map((rect, i) => (
                                <RectContainer key={'rect-' + i} x={rect[0]} y={rect[1]}
                                    label={rect[2]} index={i}
                                    type={rect[2] === "Who" ? 2 : 1}
                                    _onCreated={this.rectFactory(i)}
                                    _onLink={this.linkFactory(i)}
                                    cb_link_down={this.cbDownFactory}
                                    cb_rect_down={this.rectDownFactory}
                                    modify_label = {this.rectModifyLabel(i)}
                                />
                            ))
                        } </g>

                        <path stroke="#aaa" fill="transparent" d={d}
                            markerEnd='url(#marker-circle)' markerStart="url(#marker-circle)"
                        />
                        <g> {
                            links.map((link, i) => (
                                <Link key={'link-' + i} link={link} />
                            ))
                        } </g>
                    </g>
                </svg>
            </div>
        )
    }
}

export default PathContainer;