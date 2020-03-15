import React from 'react';
import './list.css';
import ListItem from './ListItem'
import { connect } from 'react-redux';

// const data = [
//   {
//     firstValue:1060,
//     secondValue:null,
//     thirdValue:"mHuangTingJian",
//     fourthValue:"12memberofVag",
//     fifthValue:"gmuZhiMing"
//   },
//   {
//     firstValue:null,
//     secondValue:"taofa",
//     thirdValue:"nHuangTingJian",
//     fourthValue:"shello",
//     fifthValue:"rmuZhiMing"
//   },
//   {
//     firstValue:1045,
//     secondValue:"jianyan",
//     thirdValue:"HuangTingJian",
//     fourthValue:null,
//     fifthValue:"smuZhiMing"
//   },
//   {
//     firstValue:1048,
//     secondValue:null,
//     thirdValue:"HuangTingJian",
//     fourthValue:"hello",
//     fifthValue:"smuZhiMing"
//   },
//   {
//     firstValue:1042,
//     secondValue:"shangshu",
//     thirdValue:"HuangTingJian",
//     fourthValue:null,
//     fifthValue:"dmuZhiMing"
//   }
// ]
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
                key={`ListItem${i}`}
                firstValue={v[0]} 
                secondValue ={v[1]}
                thirdValue = {v[2]}
                fourthValue = {v[3]}
                fifthValue = {v[4]}
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