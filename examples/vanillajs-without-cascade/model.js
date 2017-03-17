'use strict';
class model {
	constructor(){
		this.config = {
			S : {
				Green : 5,
				Red : 6
			},
			M : {
				White : 13,
				Black : 15
			}
		}

		this.size = null;
		this.color = null;
		this.quantity = null;
	}
	
	setSize(size, callback){
		if(this.config.hasOwnProperty(size)){
			this.size = size;
		}
		callback();
	}
	
	setColor(color, callback){
		if(this.config[this.size].hasOwnProperty(color)){
			this.color = color;
		}
		callback();
	}
	
	setQuantity(quantity, callback){
		if(typeof quantity !== 'number'){
			return;
		}
		quantity = Math.round(quantity);
		
		var stock = this.getStock();
		
		if(quantity < 1){
			this.quantity = 1;
		}else if(quantity > stock){
			this.quantity = stock;
		}else{
			this.quantity = quantity;
		}
		callback();
	}
	
	getAllowedSizes(){
		return Object.keys(this.config);
	}
	
	getAllowedColors(){
		return Object.keys(this.config[this.size]);
	}
	
	getStock(){
		return this.config[this.size][this.color]
	}
	
	getSize(){
		return this.size;
	}
	
	getColor(){
		return this.color;
	}
	
	getQuantity(){
		return this.quantity;
	}
}

module.exports = model;
