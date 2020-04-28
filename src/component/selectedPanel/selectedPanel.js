import React, { useState, useRef } from 'react';
import './selectedPanel.css';
import { List } from 'react-virtualized';

function SelectedPanel({ title, setClicked, clicked = [], options = [] }) {
	const [expanded, setExpanded] = useState(false);
	const [value, setValue] = useState("");
	const [_debounceTimeout, setDebounceTimeout] = useState(null);
	const $list = useRef(null);
	const [actual, setActual] = useState(options.map((e,i) => {
		e['index'] = i;
		return e;
	}));
	const [hideIcons, setHideIcons] = useState(false)

	const $input = useRef(null);
	function activePanel() {
		setExpanded(true);
		$input.current.focus();
	}

	function onChange(e) {
		let _input = e.target.value.trim();
		setValue(_input)
		if (_debounceTimeout) {
			clearTimeout(_debounceTimeout);
		}
		setDebounceTimeout(
			setTimeout(
				() => {	
					setActual(
						options.filter(option => 
							option['label'].indexOf(_input)!==-1 
							|| option['label'] === 'all')
					) 
			}, 300)
		) 
	}

	function clickEvent(event, i) {
		event.stopPropagation();
		setClicked(i);
		$input.current.blur();
	}

	function toggle() {
		setExpanded(!expanded)
	}

	function clickAction(index) {
		if(index === 0) {
			// 是选择全部
			actual.forEach((e, i) => i !== 0 && setClicked(e['index']))
		} else {
			setClicked(index);
		}
		setValue("");
		setActual(options)
		setHideIcons(false)
	}
	

	function _renderRow({index, key, style}) {
		// if(isScrolling) {
		// 	return <div key = {key}  className={"dropdown__list-item"}></div>
		// }

		let option  = actual[index]
			
		return (
			<div
				key = {key}
				value={option['label']}
				className={"dropdown__list-item"}
				style={style}
				onClick={() => clickAction(option['index'])}
			>
				<input type="checkbox" checked={clicked[option['index']]} readOnly />
				{index === 0 && option['value'] === 'all' ? 'Selected all  ' : option['label']}
			</div>
		)
	}

	function toHideIcons() {
		setHideIcons(true)
	}

	function toShowIcons() {
		setHideIcons(false)
	}

	return (
		<div className="selected-panel">
			<div className="divider"><p>{title}</p></div>
			<div className="dropdown">
				<div className="dropdown__container">
					<div
						role="button"
						aria-labelledby="dropdown-label"
						className="dropdown__selected"
						style={options.length === 0 ? { pointerEvents: "none" } : {}}
						onClick={activePanel}
					>
						<input className="dropdown-input" 
							ref={$input} value={value} onChange={onChange} 
							onFocus={toHideIcons} onBlur = {toShowIcons} />
						<div className="dropdown-icons">
						{
							hideIcons || options.map((val, i) => {
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
				</div>
				<div role="list" className="dropdown__list-container">
					{
						expanded && 
						<div className="dropdown__list open">
							<List
								width={260}
								height={136}
								ref={$list}
								rowHeight={30}
								rowRenderer={_renderRow}
								rowCount={actual.length}
								// overscanRowCount={100}
								// scrollToAlignment="start"
								// onRowsRendered={onRowsRendered}
							/>
						</div>
					}
				</div>
			</div>
		</div>
	);
}

export default SelectedPanel;