import React from 'react';
import './list.css';
import ListItem from './ListItem'

const data = [
  {
    firstValue:1060,
    secondValue:null,
    thirdValue:"mHuangTingJian",
    fourthValue:"12memberofVag",
    fifthValue:"gmuZhiMing"
  },
  {
    firstValue:null,
    secondValue:"taofa",
    thirdValue:"nHuangTingJian",
    fourthValue:"shello",
    fifthValue:"rmuZhiMing"
  },
  {
    firstValue:1045,
    secondValue:"jianyan",
    thirdValue:"HuangTingJian",
    fourthValue:null,
    fifthValue:"smuZhiMing"
  },
  {
    firstValue:1048,
    secondValue:null,
    thirdValue:"HuangTingJian",
    fourthValue:"hello",
    fifthValue:"smuZhiMing"
  },
  {
    firstValue:1042,
    secondValue:"shangshu",
    thirdValue:"HuangTingJian",
    fourthValue:null,
    fifthValue:"dmuZhiMing"
  }
]
class SelectList extends React.Component{
  constructor(props){
    super(props)
    this.state={

    }
  }
  render(){
    return(
      <div className="chart-wrapper">
        <div className="title">Select List</div>
        <div>
          {
            data.map((v,i)=>(
              <ListItem 
                key={`ListItem${i}`}
                firstValue={v.firstValue} 
                secondValue ={v.secondValue}
                thirdValue = {v.thirdValue}
                fourthValue = {v.fourthValue}
                fifthValue = {v.fifthValue}
              ></ListItem>
             )
            )
          }
          
        </div>

      </div>
    )
  }
}

export default SelectList;