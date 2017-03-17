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