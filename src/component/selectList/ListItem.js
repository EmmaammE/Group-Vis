import React from 'react';
import './list.css';

class ListItem extends React.Component{
  constructor(props){
    super(props)
    this.state={

    }
  }
  render(){
    // console.log("props",this.props)
    let data = this.props.data.join("")
    const firstValue = this.props.firstValue?this.props.firstValue:"¤";
    const secondValue =this.props.secondValue?this.props.secondValue:"¤";
    const thirdValue =this.props.thirdValue?this.props.thirdValue:"¤";
    const fourthValue =this.props.fourthValue?this.props.fourthValue:"¤";
    const fifthValue =this.props.fifthValue?this.props.fifthValue:"¤";
    return(
      <div className="listItem-out">
        <div className="listItem-out-middle">
          <p className="listItem-line selectList-scrollbar">
            {data}
          </p >
        </div>
        
        {/* <div className="listItem-in listFirst">
          <div className="textItem">
            {firstValue}
          </div>
        </div>
        <div className="listItem-in listSecond">
          <div className="textItem">
            {secondValue}
          </div>
        </div>
        <div className="listItem-in listThird">
          <div className="textItem">
             {thirdValue}
          </div>
        </div>
        <div className="listItem-in listFourth">
          <div className="textItem">
            {fourthValue}
          </div>
        </div>
        <div className="listItem-in listFifth">
          <div className="textItem">
            {fifthValue}
          </div>
        </div> */}
      </div>
    )
  }
}

export default ListItem;