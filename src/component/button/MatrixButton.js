import React from 'react';
import './matrixButton.css';

class MatrixButton extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
    this.$container = React.createRef();
  }


  render(){
    const cn = `matrixButton ${this.props.cName}`
    return (
      <button className={cn}>
        {this.props.btnName}
      </button>
    )
  }
}

export default MatrixButton;
