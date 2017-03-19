var Cascade = require('..');

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


test('test state without default value', () => {
	var cascadeObj = new Cascade();
	var onSetValueMock = jest.fn().mockImplementation(onSetValue);
	var Interger = Cascade.extendDataType(onSetValueMock);
	
	cascadeObj.define('myTest', null, () => Interger(1, 10));
	
	expect(onSetValueMock).toHaveBeenCalledTimes(1);
	expect(onSetValueMock).lastCalledWith(undefined, undefined, 1, 10);
	
	expect(cascadeObj.getState('myTest')).toBe(1);
});

test('test state with default value', () => {
	var cascadeObj = new Cascade();
	var onSetValueMock = jest.fn().mockImplementation(onSetValue);
	var Interger = Cascade.extendDataType(onSetValueMock);
	
	cascadeObj.define('myTest', null, () => Interger(1, 10), null, 5);
	
	expect(onSetValueMock).toHaveBeenCalledTimes(1);
	expect(onSetValueMock).lastCalledWith(5, undefined, 1, 10);
	expect(cascadeObj.getState('myTest')).toBe(5);
});


test('test setState', () => {
	var cascadeObj = new Cascade();
	var onSetValueMock = jest.fn().mockImplementation(onSetValue);
	var Interger = Cascade.extendDataType(onSetValueMock);
	
	cascadeObj.define('myTest', null, () => Interger(1, 10));
	
	cascadeObj.setState('myTest', 6);
	
	expect(onSetValueMock).toHaveBeenCalledTimes(2);
	expect(onSetValueMock).lastCalledWith(6, 1, 1, 10);
	expect(cascadeObj.getState('myTest')).toBe(6);
});

test('test adapt value', () => {
	var cascadeObj = new Cascade();
	var onSetValueMock = jest.fn().mockImplementation(onSetValue);
	var Interger = Cascade.extendDataType(onSetValueMock);
	
	cascadeObj.define('maxValue', null, () => Cascade.types.Any(), null, 10);
	cascadeObj.define('minValue', null, () => Cascade.types.Any(), null, 1);
	cascadeObj.define('myTest', ['minValue', 'maxValue'], (minValue, maxValue) => Interger(minValue, maxValue), null, 18);
	
	expect(onSetValueMock).toHaveBeenCalledTimes(1);
	expect(onSetValueMock).lastCalledWith(18, undefined, 1, 10);
	expect(cascadeObj.getState('myTest')).toBe(10);
	
	cascadeObj.setState('maxValue', 7);
	
	expect(onSetValueMock).toHaveBeenCalledTimes(2);
	expect(onSetValueMock).lastCalledWith(10, undefined, 1, 7);
	expect(cascadeObj.getState('myTest')).toBe(7);
});
