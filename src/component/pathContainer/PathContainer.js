import React, { useEffect , useRef} from 'react';
import * as d3 from 'd3';
import { PathHistory } from './pathHistory';

const RECT_WIDTH  = 35;
const RECT_HEIGHT = 15;
const RADIUS = 5;

function Rect({label, x, y, _draglink, _onCreated,_onLink, cb_over, cb_link_down, cb_rect_down}) {
    const $rect = useRef(null);

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
                        .subject(() => ({ x: x+RECT_WIDTH, y: y+RECT_HEIGHT}))
                        .on('drag', _onLink).on('end', cb_link_down))
        }
    }, [x, y, _draglink, _onLink, cb_link_down])

    return (
        <g  ref = {$rect} onMouseOver={cb_over}>
            <rect width={2*RECT_WIDTH} height={2*RECT_HEIGHT} fill="#fbfbfb" stroke="#aaaaaa" 
                x = {x} y={y} rx={RADIUS} ry={RADIUS} cursor="pointer" /> 
            <text x={x+RECT_WIDTH} y={y+RECT_HEIGHT} 
                dominantBaseline="middle" textAnchor="middle" style={{pointerEvents:'none'}}
            >{label}</text>
        </g>
    )
}

let temp_rects = ['Who','Event','Traget','Who','Event','Traget','Who','Event','Traget']
    .map((e,i)=>[(RECT_WIDTH*2+10)*i, RECT_HEIGHT, e]);

class PathContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            rects: [],
            links: [],
            // 是否开始画连接了
            _draglink: false,
            _created: -1,
            // 上一次创建时的x坐标
            _x: 0,
            d: '',
            pathHistory: new PathHistory()
        }
        this.$rects = React.createRef();
        // 供拖拽的节点label种类
        this.$temp_rects = React.createRef();

        this.handleScroll = this.handleScroll.bind(this);
        this.rectDownFactory = this.rectDownFactory.bind(this);
        this.cbDownFactory = this.cbDownFactory.bind(this);
        this._onClickRedo = this._onClickRedo.bind(this);
        this._onClickUndo = this._onClickUndo.bind(this);
    }
    
    handleScroll() {
        let {_created, _x, rects} = this.state;
        if(_created!==-1) {
        console.log('scroll',_created,rects,temp_rects);

            if(rects.length > 0) {
                let _p = rects.length - 1;
                if( rects[_p][0]=== _x && rects[_p][1]===temp_rects[_created][1]) {
                        console.log('clear');
                    rects.pop();

                    this.setState({
                        _created: -1,
                        rects
                    })
                }
            }
        }
    }

    // 返回修改rect位置的函数
    rectFactory(index) {
        return () => {
            console.log('drag',index);
            let { rects, pathHistory } = this.state;
            let _r = rects[index];
            _r[0] = _r[0]+d3.event.dx;
            _r[1] = _r[1]+d3.event.dy;
           
            this.setState({
                rects,
                pathHistory
            })
        }
    }

    // 返回rect拖拽完成的函数
    rectDownFactory() {
        let { rects, links, pathHistory } = this.state;
        pathHistory.add(rects,links);

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
        let {d, rects, links, pathHistory} = this.state;
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
            // 美化连接（未考虑冲突）
            let {x,y} = d3.event.subject;
            let source_x, source_y, target_x, target_y;

            if(Math.abs(y-rects[flag][1]-RECT_HEIGHT)<2*RECT_HEIGHT){
                // 如果连接的终点和起点近乎一条水平线
                source_y = y;
                target_y = rects[flag][1]+RECT_HEIGHT;
                if(x+RECT_WIDTH<rects[flag][0]) {
                    // 起点在左边
                    source_x = x+RECT_WIDTH;
                    target_x = rects[flag][0];
                } else {
                    source_x =x-RECT_WIDTH
                    target_x = rects[flag][0]+2*RECT_WIDTH;
                }
                
            } else if(y+RECT_HEIGHT < rects[flag][1]) {
                // 起点在上面
                source_y = y + RECT_HEIGHT;
                target_y = rects[flag][1];
            } else {
                // 起点在下面
                source_y = y - RECT_HEIGHT;
                target_y = rects[flag][1] + 2*RECT_HEIGHT;
            }

            if(source_x === undefined) {
                source_x = x;
                target_x = rects[flag][0] + RECT_WIDTH;
            }
            
            links.push(`M${source_x},${source_y} L${target_x},${target_y}`);
            pathHistory.add(rects,links)
           
            this.setState({
                d: '',
                links,
                pathHistory
            })
        }
    }

    _handleRectOver(index) {
        let {_created, rects, _x} = this.state;
        if(_created === -1 || index !== _created) {
            console.log('hover');
            if(index!==_created) {
                // 有rect没有移动
                if(rects.length>1 && rects[rects.length-1][0]===_x
                    && rects[rects.length-1][1]===temp_rects[index][1]) {
                        console.log('clear');
                    rects.pop();
                }
            } 
            let this_x = temp_rects[index][0] - this.$temp_rects.current.scrollLeft+20;
            rects.push([
                temp_rects[index][0] - this.$temp_rects.current.scrollLeft+20,
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
            rects: pathHistory.present.rects,
            links: pathHistory.present.links,
        })
    }

    _onClickUndo() {
        let {pathHistory} = this.state;
        pathHistory.undo();
        this.setState({
            pathHistory,
            rects: pathHistory.present.rects,
            links: pathHistory.present.links,
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
                    
                    <foreignObject x="20" y="0" width="18vw" height={RECT_HEIGHT*5}>
                        <div xmlns="http://www.w3.org/1999/xhtml" 
                            ref={this.$temp_rects}
                            onScroll = {this.handleScroll}
                            style={{width:"17vw",height:`${RECT_HEIGHT*3+10}`,overflowX:'scroll',overflowY:'hidden'}}>
                            <svg height={RECT_HEIGHT*3+10} width={temp_rects.length*(RECT_WIDTH*2+10)}> 
                                {
                                    temp_rects.map((rect,i) => (
                                        <Rect key={'temp-'+i} x={rect[0]} y={rect[1]} label={rect[2]} 
                                            cb_over = {()=>this._handleRectOver(i)}
                                        />
                                    ))
                                }
                            </svg>
                        </div>
                    </foreignObject>

                    <foreignObject x="160" y="75" width="100px" height="50px">
                        <div xmlns="http://www.w3.org/1999/xhtml" style={{display:'flex'}}>
                            <button onClick={this._onClickUndo}>Undo</button>
                            <button onClick={this._onClickRedo}>Redo</button>
                        </div>
                    </foreignObject>
                    <circle cx={270} cy={85} r={5} onClick={()=>this.setState({_draglink: true})}></circle>


                    <g ref={this.$rects}> 
                    {
                        rects.map((rect,i) => (
                            <Rect key={'rect-'+i} x={rect[0]} y={rect[1]} label={rect[2]}
                                _draglink = {_draglink}
                                _onCreated = {this.rectFactory(i)}
                                _onLink = {this.linkFactory(i)}
                                cb_link_down = {this.cbDownFactory}
                                cb_rect_down = {this.rectDownFactory}
                            />
                        ))
                    }
                    </g> 
                    
                    <path stroke="#aaa" fill="transparent" d={d}
                        markerEnd='url(#marker-circle)' markerStart="url(#marker-circle)"
                    />
                    {
                        links.map((link,i) => (
                            <path key={'link-'+i} stroke="#aaa" fill="transparent" d={link}
                                strokeDasharray="5" 
                                markerEnd='url(#marker-circle)' markerStart="url(#marker-circle)"
                            />
                        ))
                    }
                </svg>
            </div>
        )
    }
}

export default PathContainer;