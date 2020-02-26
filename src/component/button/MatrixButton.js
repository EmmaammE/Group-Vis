import React from 'react';
import './matrixButton.css';

class MatrixButton extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
    this.$container = React.createRef();
  }

  componentDidMount(){
    
  }

  render(){
    return (
      <button className={this.props.cName}>{this.props.btnName}</button>
    )
  }
}

export default MatrixButton;
