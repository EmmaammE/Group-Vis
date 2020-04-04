import React from 'react';
import './tooltip.css';
import ListItem from '../selectList/ListItem'

class Tip extends React.Component{
  constructor(props){
    super(props)
    this.state={

    }
    this.$container = React.createRef()
  }
  render(){
    let data = this.props.data
    let title = this.props.title
    let style = this.props.style
    let tipHasX = this.props.tipHasX
    let handleClickX = this.props.handleClickX
    return(
      <div 
        className="tooltip-box"
        style={style}
        ref = {this.$container}
      >
        <div className="tooltip-head">
          <div className="tooltip-head-title">
            {title}
          </div>
          {
            tipHasX?
            <div className="tooltip-head-close"
              onClick = {handleClickX}
            >
              X
            </div>
            :null
          }
          
        </div>
        <div className="tooltip-content"> 
          {
            data.length==1?<div>{data[0]}</div>
            :data.map((v,i)=>(
              <ListItem 
                data={v}
                key={`ListItem${i}`}
              ></ListItem>
             )
            )
          }
        </div>
      </div>
    )
  }
}




export default Tip;