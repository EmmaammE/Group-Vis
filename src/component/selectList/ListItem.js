import React from 'react';
import './list.css';

class ListItem extends React.Component{
  constructor(props){
    super(props)
    this.state={

    }
  }
  render(){
    console.log("props",this.props)
    const firstValue = this.props.firstValue?this.props.firstValue:"¤";
    const secondValue =this.props.secondValue?this.props.secondValue:"¤";
    const thirdValue =this.props.thirdValue?this.props.thirdValue:"¤";
    const fourthValue =this.props.fourthValue?this.props.fourthValue:"¤";
    const fifthValue =this.props.fifthValue?this.props.fifthValue:"¤";
    return(
      <div className="listItem-out">
        <div className="listItem-in listFirst">{firstValue}</div>
        <div className="listItem-in listSecond">{secondValue}</div>
        <div className="listItem-in listThird">{thirdValue}</div>
        <div className="listItem-in listFourth">{fourthValue}</div>
        <div className="listItem-in listFifth">{fifthValue}</div>
      </div>
    )
  }
}

export default ListItem;