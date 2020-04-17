import React from 'react';
import './selectedPanel.css'

const customStyles = {
    // select: () => ({
    //     width: '14vw',
    //   }),
    // option: () => ({
    //     width: '90%'
    // })
}
function SelectPanel({title, setClicked, clicked = [], options = []}) {
    return (
        <div className="selected-panel">
			<div className="divider"><p>{title}</p></div>
            <Select
                // defaultValue={[options[2], options[3]]}
                isMulti
                isSearchable
                closeMenuOnSelect={false}
                // styles = {customStyles}
                name={title}
                theme = "neutral20"
                options={options}
                className="my-multi-select"
                placeholder={title}
                // classNamePrefix="select"
                // width='200px'
            />
        </div>
        
    )
}

export default SelectPanel;