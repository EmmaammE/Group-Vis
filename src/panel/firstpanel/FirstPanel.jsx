import React from 'react';
import './firstPanel.css'

import Blobs from '../../component/blob/blob'
class FirstPanel extends React.Component {

    render() {
        return (
            <div className="first-panel">
                <h1 className="big-title">Group Vis</h1>
                <div className="blob-container">
                    <div className="title">Overview</div>
                        <Blobs/>
                    <div className="title">Control Panel</div>

                </div>
            </div>
        )
    }
}

export default FirstPanel;