import React, { useEffect , useRef} from 'react';
import * as d3 from 'd3';

const RECT_WIDTH  = 35;
const RECT_HEIGHT = 15;
const RADIUS = 5;

function Rect({label, x, y, _draglink, _onCreated,_onLink, cb_over, cb_down}) {
    const $rect = useRef(null);

    useEffect(()=> {
        if(_draglink===false) {
            // 拖拽移动
            console.log('effect');
            d3.select($rect.current)
                .call(d3.drag().on('drag',_onCreated))  
        } else {
            d3.select($rect.current)
                .call(d3.drag().on('drag', _onLink).on('end',cb_down))
        }
    },[_draglink,_onCreated,_onLink,cb_down])

    return (
        <g  ref = {$rect} onMouseOver={cb_over}>
            <rect width={2*RECT_WIDTH} height={2*RECT_HEIGHT} fill="#fbfbfb" stroke="#aaaaaa" 
                x = {x} y={y} rx={RADIUS} ry={RADIUS} cursor="pointer" /> 
            <circle cx={x+RECT_WIDTH} cy={y} r={RADIUS} stroke="#aaa" fill="#fbfbfb" />
            <text x={x+RECT_WIDTH} y={y+RECT_HEIGHT} dominantBaseline="middle" textAnchor="middle">{label}</text>
            <circle cx={x+RECT_WIDTH} cy={y+2*RECT_HEIGHT} r={RADIUS} stroke="#aaa" fill="#fbfbfb" />
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
            d: '',
        }
        this.$rects = React.createRef();
        // 供拖拽的节点label种类
        this.$temp_rects = React.createRef();
        this.handleScroll = this.handleScroll.bind(this);
    }
    
    handleScroll() {
        let {_created, rects} = this.state;
        console.log('scroll');
        if(_created!==-1) {
            if(rects.length>1 && rects[rects.length-1][0]===temp_rects[_created][0] 
                && rects[rects.length-1][1]===temp_rects[_created][1]) {
                rects.pop();
            }
            this.setState({
                _created: -1,
                rects
            })
        }
    }

    // 返回修改rect位置的函数
    rectFactory(index) {
        return () => {
            console.log('drag',index);
            let { rects } = this.state;
            let _r = rects[index];
            _r[0] = _r[0]+d3.event.dx;
            _r[1] = _r[1]+d3.event.dy;

            this.setState({
                rects,
            })
        }
    }

    linkFactory(index) {
        return ()=>{
            let source_x = this.state.rects[index][0]+RECT_WIDTH;
            let source_y = this.state.rects[index][1]+RECT_HEIGHT;
            console.log(d3.event);
            this.setState({
                d:`M${source_x},${source_y}L${d3.event.x},${d3.event.y}`
            })
        }
    }

    cbDownFactory = () =>{
        let {d,links} = this.state;
        links.push(d);
        this.setState({
            d: '',
            links
        })
    }

    _handleRectOver(index) {
        let {_created, rects} = this.state;
        if(_created === -1 || index !== _created) {
            if(index!==_created) {
                // 有rect没有移动
                if(rects.length>1 && rects[rects.length-1][0]===temp_rects[index][0] 
                    && rects[rects.length-1][1]===temp_rects[index][1]) {
                    rects.pop();
                }
            } 
            console.log('created   ',index,'  index');
            rects.push([
                temp_rects[index][0] - this.$temp_rects.current.scrollLeft+20,
                temp_rects[index][1], 
                temp_rects[index][2]
            ])
            this.setState({
                _created: index,
                _draglink: false,
                rects
            })
        } 
    }

    render() {
        let {rects,links,d,_draglink} = this.state

        return (
            <div>
                <svg width="100%" height="100%" viewBox="0 0 300 400"
                    xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <marker id="end-arrow" viewBox="0 -10 20 20" refX="6" markerWidth="8" markerHeight="8" orient="auto">
                            <path d="M0,-10L20,0L0,10" fill="transparent" stroke="#aaa"></path>
                        </marker>
                    </defs>
                    <defs>
                        <marker id="start-arrow" viewBox="0 -10 20 20" refX="4" markerWidth="5" markerHeight="5" orient="auto">
                            {/* <path d="M20,-10L0,0L20,10" fill="#000"></path> */}
                            <circle r={RADIUS} stroke="#aaa" fill="#fbfbfb" />
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

                    <g ref={this.$rects}> 
                    {
                        rects.map((rect,i) => (
                            <Rect key={'rect-'+i} x={rect[0]} y={rect[1]} label={rect[2]}
                                _draglink = {_draglink}
                                _onCreated = {this.rectFactory(i)}
                                _onLink = {this.linkFactory(i)}
                                cb_down = {this.cbDownFactory}
                            />
                        ))
                    }
                    </g> 
                    <circle r={5} onClick={()=>this.setState({_draglink: true})}></circle>
                    
                    <path stroke="black" fill="transparent" d={d} markerEnd='url(#end-arrow)'
                        markerStart="url(#start-arrow)"
                    />
                    {
                        links.map((link,i) => (
                            <path key={'link-'+i} stroke="black" fill="transparent" d={link} 
                                markerEnd='url(#end-arrow)' markerStart="url(#start-arrow)"
                            />
                        ))
                    }
                </svg>
            </div>
        )
    }
}

export default PathContainer;