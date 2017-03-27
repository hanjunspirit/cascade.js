var React = require('react');
/**
 * @param {Array} options
 * @param {String} current
 * @param {String} label
 * @param {Function} handleClick(option)
 */
module.exports = function(props){
	var optionsElement = props.options.map(option => {
		return <label className={option === props.current ? 'current' : ''} onClick={props.handleClick.bind(null, option)}><span>{option}</span></label>
	});
	
	return (
		<div className="control-group">
			<label className="control-label">{props.label}</label>
			<div className="controls">
				<div className="controls-option cf">{optionsElement}</div>
			</div>
		</div>
	)
}
