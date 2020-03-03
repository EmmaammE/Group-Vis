import React from 'react';
import './matrixButton.css';

class MatrixButton extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      
    }
  }


  render(){
    const cn = `matrixButton ${this.props.cName}`
    return (
      <button className={cn} id={this.props.id}>
        {this.props.btnName}
      </button>
    )
  }
}

export default MatrixButton;
