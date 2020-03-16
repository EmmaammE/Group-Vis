import React from 'react';
import './list.css';
import ListItem from './ListItem'
import { connect } from 'react-redux';

class SelectList extends React.Component{
  constructor(props){
    super(props)
    this.state={

    }
  }
  render(){
    let data = this.props.selectListView.selectListData
    // console.log("selectListData",this.props,data)
    return(
      <div className="chart-wrapper content-panel">
        <div className="title">Select List</div>
        <div className="selectList-container"> 
          {
            data.map((v,i)=>(
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


const mapStateToProps = (state)=>({
  selectListView:state.selectListView
})



export default connect(mapStateToProps)(SelectList);