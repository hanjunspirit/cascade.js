(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./model":2,"./view":3}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
'use strict';
function qs(selector) {
	return document.querySelector(selector);
}

function qsa(selector, scope) {
	return (scope || document).querySelectorAll(selector);
}

// Attach a handler to event for all elements that match the selector,
	// now or in the future, based on a root element
function delegate(target, selector, type, handler) {
	function dispatchEvent(event) {
		var targetElement = event.target;
		var potentialElements = qsa(selector, target);
		var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

		if (hasMatch) {
			handler.call(targetElement, event);
		}
	}

	// https://developer.mozilla.org/en-US/docs/Web/Events/blur
	var useCapture = type === 'blur' || type === 'focus';

	target.addEventListener(type, dispatchEvent, useCapture);
};

class view {
	
	constructor(){
		this.sizeOptions = qs('#size_options');
		this.colorOptions = qs('#color_options');
		this.quantity = qs('#quantity');
	}
	
	renderSizeOptions(options){
		this.sizeOptions.innerHTML = options.map(option => {
			return '<label data-option="' + option + '"><span>' + option + '</span></label>';
		}).join("");
	}
	
	renderColorOptions(options){
		this.colorOptions.innerHTML = options.map(option => {
			return '<label data-option="' + option + '"><span>' + option + '</span></label>';
		}).join("");
	}
	
	renderSelectedSize(size){
		Array.prototype.slice.call(qsa('label', this.sizeOptions)).forEach(domOption => {
			domOption.className = domOption.dataset.option === size ? 'current' : '';
		});
	}
	
	renderSelectedColor(color){
		Array.prototype.slice.call(qsa('label', this.colorOptions)).forEach(domOption => {
			domOption.className = domOption.dataset.option === color ? 'current' : '';
		});
	}
	
	setQuantity(quantity){
		this.quantity.value = quantity;
	}
	
	bind(event, handler){
		if (event === 'clickSize') {
			delegate(this.sizeOptions, 'span', 'click', function () {
				if(this.parentNode.nodeName === 'LABEL'){
					handler({
						option : this.parentNode.dataset.option,
					});
				}
			});
		}else if(event === 'clickColor'){
			delegate(this.colorOptions, 'span', 'click', function () {
				if(this.parentNode.nodeName === 'LABEL'){
					handler({
						option : this.parentNode.dataset.option
					});
				}
			});
		}else if(event === 'quantityInput'){
			this.quantity.addEventListener('input', () => {
				handler(this.quantity.value.replace(/[^0-9]/g, '') * 1);
			});
			
			qs('#quantity_plus').addEventListener('click', () => {
				handler(this.quantity.value.replace(/[^0-9]/g, '') * 1 + 1);
			});
			
			qs('#quantity_reduce').addEventListener('click', () => {
				handler(this.quantity.value.replace(/[^0-9]/g, '') * 1 - 1);
			});
		}
	}
}

module.exports = view;
},{}]},{},[1]);
