import React from 'react';

import './matrixChart.css';
import { MatrixPaint , matrixData} from './matrixPaint'
import MatrixButton from '../button/MatrixButton'
import VerticalSlider from '../verticalSlider/VerticalSlider'

// 暂时的假数据


class Matrix extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
    this.$container = React.createRef();
  }

  componentDidMount(){
    let containerDom = this.$container.current;
    let labels = ['SuShi', 'WangAnshi', 'SuZhe', 'OuYangxiu', 'ZhengXie', 'SuShi', 'WangAnshi', 'SuZhe', 'OuYangxiu', 'ZhengXie','SuShi', 'WangAnshi', 'SuZhe', 'OuYangxiu', 'ZhengXie'];
    let width = Math.min(containerDom.clientWidth,containerDom.clientHeight)

    MatrixPaint({
      width:width,
      container : containerDom,
      data      : matrixData,
      labels    : labels,
      start_color : 'red',
      end_color : 'rgb(3, 93, 195)'
    });
  }
  render(){
    const btnData = [{btnName:"comp",cName:""},
        {btnName:"senti",cName:"choose_btn"},
        {btnName:"quantity",cName:""}
    ]
    return (
      <div className="chart-wrapper">
        <div className="header-line">
          <div className="title">People Matrix View</div>
          <div className="mButtonContainer">{btnData.map(v=>(
            <MatrixButton key={v.btnName} btnName={v.btnName} cName={v.cName}></MatrixButton>))}
          </div>
        </div>
        
        <div ref={this.$container} className="matrix-container"></div>
        <VerticalSlider></VerticalSlider>
      </div>
      
    )
  }
}

export default Matrix;
