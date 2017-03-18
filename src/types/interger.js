var Cascade = require('../cascade');
function onSetValue(valueToSet, oldValue, min, max){
	if(typeof valueToSet === 'number'){
		var number = Math.round(valueToSet);
		if(number <= min){
			return min;
		}
		
		if(number >= max){
			return max;
		}
		
		return number;
	}
	
	if(oldValue !== undefined){
		return oldValue;
	}
	
	return min;
}

module.exports = Cascade.extendDataType(onSetValue);