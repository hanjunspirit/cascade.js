'use strict';
var model = require('./model');
var view = require('./view');

class controller {
	constructor(){
		this.model = new model();
		this.view = new view();
		
		this.view.renderSizeOptions(this.model.getAllowedSizes());
		
		this.setSize('S');
		this.setQuantity(1);
		
		this.view.bind('clickSize', (obj) => {
			this.setSize(obj.option);
		});
		
		this.view.bind('clickColor', (obj) => {
			this.setColor(obj.option);
		});
		
		this.view.bind('quantityInput', (quantity) => {
			this.setQuantity(quantity);
		});
	}
	
	setSize(size){
		this.model.setSize(size, () => {
			this.view.renderSelectedSize(this.model.getSize());
			
			this.view.renderColorOptions(this.model.getAllowedColors());
		});
		
		this.setColor(this.model.getAllowedColors()[0]);
	}
	
	setColor(color){
		this.model.setColor(color, () => {
			this.view.renderSelectedColor(this.model.getColor());
		});
		
		this.setQuantity(this.model.getQuantity());
	}
	
	setQuantity(quantity){
		this.model.setQuantity(quantity, () => {
			this.view.setQuantity(this.model.getQuantity());
		});
	}
}

module.exports = new controller();
