import React, { useState, useRef } from 'react';
import './selectedPanel.css';

function SelectedPanel({ title, setClicked, clicked = [], options = [] }) {
	const [expanded, setExpanded] = useState(false);
	const [value, setValue] = useState("");

	const $input = useRef(null);
	function activePanel() {
		setExpanded(true);
		$input.current.focus();
	}

	function onChange(e) {
		setValue(e.target.value.trim())
	}

	function clickEvent(event, i) {
		event.stopPropagation();
		setClicked(i);
		$input.current.blur();
	}

	function toggle() {
		setExpanded(!expanded)
	}

	return (
		<div className="selected-panel">
			<div className="divider"><p>{title}</p></div>
			<ul className="dropdown">
				<li className="dropdown__container">
					<div
						role="button"
						aria-labelledby="dropdown-label"
						className="dropdown__selected"
						style={options.length === 0 ? { pointerEvents: "none" } : {}}
						onClick={activePanel}
					>
						<input className="dropdown-input" ref={$input} value={value} onChange={onChange} />
						<div className="dropdown-icons">
						{
							options.map((val, i) => {
								if (clicked[i]) {
									return (
									<span key={'icon-' + i} className="icon" onClick={(e) => clickEvent(e, i)}>{val['label']}</span>)
								} else {
									return null;
								}
							})
						}
						</div>
					</div>
					<div className="svg-badge"
						onClick={toggle}
					>
						<svg
							className={["dropdown__arrow", expanded ? "expanded" : ""].join(" ")}
							width="10"
							height="5"
							viewBox="0 0 10 5"
							fillRule="evenodd"
						>
							<title>Open drop down</title>
							<path d="M10 0L5 5 0 0z"></path>
						</svg>
					</div>
				</li>
				<li role="list" className="dropdown__list-container">
					<ul className={expanded ? "dropdown__list open" : "dropdown__list"}
						onMouseMove={() => setExpanded(true)}
						// onMouseOut={() => setExpanded(false)}
					>
						{
							options.map((option, index) => {
								if (value.length === 0 || option['label'].indexOf(value) !== -1 || index === 0) {
									return (
										<li
											key={`option-${index}`} value={option['label']}
											className={"dropdown__list-item"}
											onClick={() => {
												setClicked(index);
												setValue("")
											}}
										>
											<input type="checkbox" checked={clicked[index]} readOnly />
											{index === 0 && option[0] === 'all' ? 'Selected all  ' : option['label']}
										</li>
									)
								} else {
									return null
								}
							})
						}
					</ul>
				</li>
			</ul>
		</div>
	);
}

export default SelectedPanel;