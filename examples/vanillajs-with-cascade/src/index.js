'use strict';
var model = require('./model');
var view = require('./view');

class controller {
	constructor(){
		this.model = model;
		this.view = new view();
		
		this.view.render(this.model.getStates());
		
		this.model.subscribe(updatedStates => {
			this.view.render(updatedStates);
		});
		
		this.view.bind('clickSize', (obj) => {
			this.model.setState('size', obj.option);
		});
		
		this.view.bind('clickColor', (obj) => {
			this.model.setState('color', obj.option);
		});
		
		this.view.bind('quantityInput', (quantity) => {
			this.model.setState('quantity', quantity);
		});
	}
}

module.exports = new controller();
