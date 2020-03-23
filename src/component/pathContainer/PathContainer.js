import React, { useEffect , useState, useRef} from 'react';
import * as d3 from 'd3';
import './path.css'
import { PathHistory } from './pathHistory';
import {debounce} from '../../util/tools';

const RECT_WIDTH  = 35;
const RECT_HEIGHT = 15;
const RADIUS = 5;

function Rect({label, x, y, index, _draglink, _onCreated,_onLink, cb_over, cb_link_down, cb_rect_down, type=0}) {
    const $rect = useRef(null);
    const $input = useRef(null);
    const [active, setActive] = useState(false);
    const [value, setValue] = useState("");
    const [_label, setLabel] = useState(label);

    useEffect(() => {
        setLabel(label)
    }, [label])

    useEffect(()=> {
        if(_draglink===false) {
            // 拖拽rect
            d3.select($rect.current)
                .call(d3.drag().on('drag',_onCreated).on('end', cb_rect_down))  
        }
    },[_draglink,_onCreated,cb_rect_down])

    useEffect(() => {
        if(_draglink) {
            d3.select($rect.current)
                .call(d3.drag()
                        .subject(() => ({ x: x+RECT_WIDTH, y: y+RECT_HEIGHT, index: index}))
                        .on('drag', _onLink).on('end', cb_link_down))
        }
    }, [x, y, index, _draglink, _onLink, cb_link_down])

    function toggleInput() {
        // console.log('click');
        if(active) {
            setActive(false);
            $input.current.blur();
            if(value!=="") {
                setLabel(value)
                setValue("")
            }
        } else {
            setActive(true);
            $input.current.focus();
            setValue("");
        }
    }

    function onInput(event) {
        // console.log(event.target);
        setValue(event.target.value);

    }

    switch(type) {
        case 1:
            return (
                <g  ref = {$rect}>
                    <rect width={2*RECT_WIDTH} height={2*RECT_HEIGHT} fill="#fbfbfb" stroke="#aaaaaa" 
                        x = {x} y={y} rx={RADIUS} ry={RADIUS} cursor="pointer" /> 
                    <foreignObject x={x} y={y-2*RECT_HEIGHT} width="150px" height={4*RECT_HEIGHT}>
                        <div className={active?"input-action":"input-block"}  onClick={toggleInput}>
                            <input className="effect-22" type="text" placeholder=""
                                ref={$input}
                                value={value} onChange={onInput}/>
                            <label>{_label}</label>
                            <span className="focus-bg"></span>
                        </div>
                    </foreignObject>
                </g>
                
            )
        case 2:
            return (
                <g  ref = {$rect}>
                    <rect width={2*RECT_WIDTH} height={2*RECT_HEIGHT} fill="#fbfbfb" stroke="#aaaaaa" 
                        x = {x} y={y} rx={RADIUS} ry={RADIUS} cursor="pointer" /> 
                    <text x={x+RECT_WIDTH} y={y+RECT_HEIGHT} 
                        style={{fontSize:'14px', pointerEvents:'none'}}
                        dominantBaseline="middle" textAnchor="middle"
                    >{label}</text>
                </g>
                
            )
        default:
            return (
                <g onMouseOver={cb_over}>
                    <rect width={2*RECT_WIDTH} height={2*RECT_HEIGHT} fill="#fbfbfb" stroke="#aaaaaa" 
                        x = {x} y={y} rx={RADIUS} ry={RADIUS} cursor="pointer" /> 
                    <text x={x+RECT_WIDTH} y={y+RECT_HEIGHT} 
                        style={{fontSize:'14px', pointerEvents:'none'}}
                        dominantBaseline="middle" textAnchor="middle"
                    >{label}</text>
                </g>
            )
    }
  
}

let temp_rects = ['Who','Input']
    .map((e,i)=>[(RECT_WIDTH*2+10)*i+10, RECT_HEIGHT, e]);

class PathContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            rects: [],
            links: [],
            rects_links: {},
            // 是否开始画连接了
            _draglink: false,
            _created: -1,
            // 上一次创建时的x坐标
            _x: 0,
            d: '',
            pathHistory: new PathHistory()
        }
        // 供拖拽的节点label种类
        this.$container = React.createRef();

        this.rectDownFactory = this.rectDownFactory.bind(this);
        this.cbDownFactory = this.cbDownFactory.bind(this);
        this._onClickRedo = this._onClickRedo.bind(this);
        this._onClickUndo = this._onClickUndo.bind(this);
        this._toggleLinkStatus = this._toggleLinkStatus.bind(this);
    }

    componentDidMount() {
        let node = this.$container.current;
        d3.select(node)
            .call(d3.zoom()
                    .on("zoom", function(){
                        debounce(transform => {
                            d3.select(node)
                                .attr("transform", transform)
                        }, 100)(d3.event.transform)
                    }))
    }

    componentWillMount() {
        d3.select(this.$container.current)
            .on("zoom", null)
    }

    // 返回修改rect位置的函数
    rectFactory(index) {
        return () => {
            let { rects, links, rects_links} = this.state;
            rects[index] = [
                rects[index][0]+d3.event.dx, 
                rects[index][1]+d3.event.dy, 
                rects[index][2]]
           
            if(rects_links[index]!==undefined) {
                // 该矩形绑定了link
                let link = links[rects_links[index]["link"]];
                let link_points = link[rects_links[index]["key"]];
                links[rects_links[index]["link"]] = {...link, 
                    ...{[rects_links[index]["key"]]:[link_points[0]+d3.event.dx, link_points[1]+d3.event.dy]}
                };
                
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
        pathHistory.add(rects,links, rects_links);

        this.setState({
            pathHistory,
            _created: -1
        })
    }

    // 返回绘制link时的函数
    linkFactory(index) {
        return ()=>{
            let source_x = this.state.rects[index][0]+RECT_WIDTH;
            let source_y = this.state.rects[index][1]+RECT_HEIGHT;
            // console.log(d3.event);
            this.setState({
                d:`M${source_x},${source_y}L${d3.event.x},${d3.event.y}`
            })
        }
    }

    // 返回link绘制完成时的函数
    cbDownFactory() {
        let {rects, links, pathHistory, rects_links} = this.state;
        // 检测link是否落在rect上
        let flag = -1;
        let x2 = d3.event.x, y2 = d3.event.y;
        for(let i=0;i<rects.length;i++) {
            if(x2 >= rects[i][0] && x2 <= rects[i][0] + 2*RECT_WIDTH
                && y2 >= rects[i][1] && y2 <= rects[i][1] + 2*RECT_HEIGHT) {
                    flag = i;
                    break;
                }
        }
        if(flag === -1) {
            // 连接无效
            this.setState({
                d: ''
            })
        } else {
            let {x,y,index} = d3.event.subject;
            if(x === rects[flag][0]+RECT_WIDTH && y === rects[flag][1]+RECT_HEIGHT) {
                this.setState({
                    d: ''
                })
            } else {
                let {source_x, source_y, target_x, target_y} = 
                this.tool_createLink(x,y,rects[flag][0], rects[flag][1])

                rects_links[index] = {key: "source", link: links.length};
                rects_links[flag] = {key: "target", link: links.length}

                links = [...links, {
                    source: [source_x, source_y],
                    target: [target_x, target_y]
                }]
                pathHistory.add(rects,links,rects_links)
            
                this.setState({
                    d: '',
                    links,
                    pathHistory
                })
            }
        }
    }

    tool_createLink(x,y,flagx, flagy) {
        // 美化连接（未考虑冲突）
        let source_x, source_y, target_x, target_y;

        if(Math.abs(y-flagy-RECT_HEIGHT)<=4*RECT_HEIGHT){
            // 如果连接的终点和起点近乎一条水平线
            source_y = y;
            target_y = flagy+RECT_HEIGHT;
            if(x+RECT_WIDTH<flagx) {
                // 起点在左边
                source_x = x+RECT_WIDTH;
                target_x = flagx;
            } else {
                source_x =x-RECT_WIDTH
                target_x =flagx+2*RECT_WIDTH;
            }
            
        } else if(y+RECT_HEIGHT < flagy) {
            // 起点在上面
            source_y = y + RECT_HEIGHT;
            target_y = flagy;
        } else {
            // 起点在下面
            source_y = y - RECT_HEIGHT;
            target_y = flagy + 2*RECT_HEIGHT;
        }

        if(source_x === undefined) {
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
        let {_created, rects, _x} = this.state;
        if(_created === -1 || index !== _created) {
            if(index!==_created) {
                // 有rect没有移动
                if(rects.length>1 && rects[rects.length-1][0]===_x
                    && rects[rects.length-1][1]===temp_rects[index][1]) {
                        // console.log('clear');
                    rects.pop();
                }
            } 
            let this_x = temp_rects[index][0];
            rects.push([
                temp_rects[index][0],
                temp_rects[index][1], 
                temp_rects[index][2]
            ])
            this.setState({
                _created: index,
                _draglink: false,
                _x: this_x,
                rects
            })
        } 
    }

    _onClickRedo() {
        let {pathHistory} = this.state;
        pathHistory.redo();
        this.setState({
            pathHistory,
            rects: pathHistory.present.rects.slice(0),
            links: pathHistory.present.links.slice(0),
            rects_links: {...pathHistory.present.rects_links}
        })
    }

    _onClickUndo() {
        let {pathHistory} = this.state;
        pathHistory.undo();
        this.setState({
            pathHistory,
            rects: pathHistory.present.rects.slice(0),
            links: pathHistory.present.links.slice(0),
            rects_links: {...pathHistory.present.rects_links}
        })
    }

    _toggleLinkStatus() {
        let {_draglink} = this.state;
        this.setState({
            _draglink: !_draglink
        })
    }

    render() {
        let {rects,links,d,_draglink} = this.state

        return (
            <div>
                <svg width="100%" height="100%" viewBox="0 0 300 400"
                    xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <marker id="marker-circle" markerWidth="10" markerHeight="10" refX="5" refY="5">
                            <circle cx="5" cy="5"  r={4} stroke="#aaa" fill="transparent"/>
                        </marker>
                    </defs>

                    <clipPath id="myClip">
                        <rect cx="18" cy="0" width="260" height="420" />
                    </clipPath>
                                        
                    <foreignObject x="180" y="20" width="100px" height="50px">
                        <div xmlns="http://www.w3.org/1999/xhtml" style={{display:'flex'}}>
                            <button onClick={this._onClickUndo}>Undo</button>
                            <button onClick={this._onClickRedo}>Redo</button>
                        </div>
                    </foreignObject>
                    <circle cx={270} cy={85} r={5} onClick={this._toggleLinkStatus}></circle>

                    <g>
                    {
                        temp_rects.map((rect,i) => (
                            <Rect key={'temp-'+i} x={rect[0]} y={rect[1]} label={rect[2]}
                                type={0}
                                cb_over = {()=>this._handleRectOver(i)}
                            />
                        ))
                    }
                    </g>


                    <g ref={this.$container} clipPath="url(#myClip)">
                        
                        <g> {
                            rects.map((rect,i) => (
                                <Rect key={'rect-'+i} x={rect[0]} y={rect[1]} 
                                    label={rect[2]} index = {i}
                                    type={rect[2]==="Who"?2:1}
                                    _draglink = {_draglink}
                                    _onCreated = {this.rectFactory(i)}
                                    _onLink = {this.linkFactory(i)}
                                    cb_link_down = {this.cbDownFactory}
                                    cb_rect_down = {this.rectDownFactory}
                                />
                            ))
                        } </g> 
                    
                        <path stroke="#aaa" fill="transparent" d={d}
                            markerEnd='url(#marker-circle)' markerStart="url(#marker-circle)"
                        />
                        <g> {
                            links.map((link,i) => (
                                <path key={'link-'+i} stroke="#aaa" fill="transparent" 
                                    d = {`M${link.source[0]},${link.source[1]} L${link.target[0]},${link.target[1]}`}
                                    strokeDasharray="5" 
                                    markerEnd='url(#marker-circle)' markerStart="url(#marker-circle)"
                                />
                            ))
                        } </g>
                    </g>
                </svg>
            </div>
        )
    }
}

export default PathContainer;