var React = require('react');
var ReactDom = require('react-dom');

var Select = require('./Select');
var config = require('../../config');

var MyPage = React.createClass({
	getInitialState(){
		return {
			config,
			size : 'S',
			color : 'Green',
			quantity : 1
		};
	},
	getAllowedSizes(){
		return Object.keys(this.state.config);
	},
	getAllowedColors(){
		return Object.keys(this.state.config[this.state.size]);
	},
	getStock(){
		return this.state.config[this.state.size][this.state.color];
	},
	handleSelectSize(size){
		if(this.state.config.hasOwnProperty(size)){
			this.setState({
				size,
			});
			
			var allowedColors = Object.keys(this.state.config[size]);
			
			var color = allowedColors.indexOf(this.state.color) !== -1 ? this.state.color : allowedColors[0];
			this.setState({
				color
			});
			
			var stock = this.state.config[size][color];
			
			this.setQuantity(this.state.quantity, stock);
		}
	},
	handleSelectColor(color){
		if(this.state.config[this.state.size].hasOwnProperty(color)){
			this.setState({
				color
			});
			
			var stock = this.state.config[this.state.size][color];
			
			this.setQuantity(this.state.quantity, stock);
		}
	},
	setQuantity(quantity, stock){
		if(typeof quantity !== 'number'){
			return;
		}
		quantity = Math.round(quantity);
		
		if(quantity < 1){
			this.setState({
				quantity : 1
			});
		}else if(quantity > stock){
			this.setState({
				quantity : stock
			});
		}else{
			this.setState({
				quantity
			});
		}
	},
	handleQuantityInput(e){
		this.setQuantity(e.target.value * 1, this.getStock());
	},
	handleQuantityPlus(){
		this.setQuantity(this.state.quantity + 1, this.getStock());
	},
	handleQuantityReduce(e){
		this.setQuantity(this.state.quantity - 1, this.getStock());
	},
	render(){
		return (
			<div className="field-group-updown">
				<Select label="Size" options={this.getAllowedSizes()} current={this.state.size} handleClick={this.handleSelectSize} />
				<Select label="Color" options={this.getAllowedColors()} current={this.state.color} handleClick={this.handleSelectColor} />
				
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
