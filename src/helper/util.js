function warning(tips){
	typeof console !== 'undefined' && console.warn(tips);
}

function error(tips){
	typeof console !== 'undefined' && console.error(tips);
	throw new Error(tips);
}

function arrayForEach(arr, callback){
	for(var i = 0; i < arr.length; i++){
		callback(arr[i], i);
	}
}
function arraySome(arr, callback){
	for(var i in arr){
		if(callback(arr[i], i)){
			return true;
		}
	}
	return false;
}
function arrayMap(arr, callback){
	var res = [];
	arrayForEach(arr, function(value, key){
		res.push(callback(value, key));
	});
	return res;
}
function arrayIndexOf(arr, toFind){
	var idx = -1;
	for(var i = 0; i < arr.length; i++){
		if(arr[i] === toFind){
			return i;
		}
	}
	return idx;
}


function assign(base){
	var list = Array.prototype.slice.call(arguments, 1);
	arrayForEach(list, function(obj){
		for(var i in obj){
			if(obj.hasOwnProperty(i)){
				base[i] = obj[i];
			}
		}
	});
}

function extendClass(Class, Super){
	var E = function () {};
	E.prototype = Super.prototype;
	var prototype = new E();

	assign(prototype, Class.prototype);
	Class.prototype = prototype;
	Class.prototype.constructor = Class;
}

module.exports = {
	warning : warning,
	error : error,
	arrayForEach : arrayForEach,
	arraySome : arraySome,
	arrayMap : arrayMap,
	arrayIndexOf : arrayIndexOf,
	assign : assign,
	extendClass : extendClass
};
