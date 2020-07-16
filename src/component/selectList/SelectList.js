import React from 'react';
import './list.css';
import { connect } from 'react-redux';
import CircleBtn from '../button/circlebtn';
import memoize from "memoize-one";
import { exportCSVFile } from '../../util/csv';
class SelectList extends React.PureComponent{
  constructor(props) {
    super(props);
    this.toDownload = this.toDownload.bind(this);
  }

  update = memoize(
    (selectListData) => [...new Set(selectListData)]
      .sort((a,b) => a.localeCompare(b))
  )

  toDownload() {
    const title = "selectList";
    exportCSVFile(null, this.update(this.props.selectListView.selectListData), title)
  }

  render(){
    const listArr = this.update(this.props.selectListView.selectListData);

    return(
      <div className="chart-wrapper content-panel">
        <div className="g-chart-title">Select List</div>
        <div className="download-container">
          <CircleBtn type={11} active={true} onClick={this.toDownload}/>
        </div>
        <div className="selectList-container"> 
          {
            listArr && listArr.map((v,i)=>(
              <div className="listItem-out" key={`ListItem${i}`}>
                <div className="listItem-out-middle">
                  <p className="listItem-line selectList-scrollbar"> 
                    {v}
                  </p >
                </div>
              </div>
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