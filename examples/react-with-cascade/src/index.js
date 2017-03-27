var React = require('react');
var ReactDom = require('react-dom');

var Select = require('./Select');
var model = require('./model');

var MyPage = React.createClass({
	getInitialState(){
		return model.getStates();
	},
	componentDidMount(){
		model.subscribe(updatedStates => {
			this.setState(updatedStates);
		});
	},
	handleSelectSize(size){
		model.setState('size', size);
	},
	handleSelectColor(color){
		model.setState('color', color);
	},
	handleQuantityInput(e){
		model.setState('quantity', e.target.value * 1);
	},
	handleQuantityPlus(){
		model.setState('quantity', this.state.quantity + 1);
	},
	handleQuantityReduce(e){
		model.setState('quantity', this.state.quantity - 1);
	},
	render(){
		return (
			<div className="field-group-updown">
				<Select label="Size" options={this.state.allowedSizes} current={this.state.size} handleClick={this.handleSelectSize} />
				<Select label="Color" options={this.state.allowedColors} current={this.state.color} handleClick={this.handleSelectColor} />
				
				<div className="control-group">
					<label className="control-label">quantity</label>
					<div className="controls">
						<div className="duration">
							<button href="javascript:void(0)" onClick={this.handleQuantityReduce}>-</button>
							<div className="dur-ipt">
								<input type="text" value={this.state.quantity} onChange={this.handleQuantityInput}/>
							</div>
							<button href="javascript:void(0)" onClick={this.handleQuantityPlus}>+</button>
						</div>
					</div>
				</div>
				<div className="btn-wrap">
					<button className="btn-primary">Buy</button>
				</div>
			</div>
		)
	}
});

ReactDom.render(<MyPage />, document.getElementById('wrapper'));
