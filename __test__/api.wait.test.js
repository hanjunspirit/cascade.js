var Cascade = require('..');
var config = require('./config');

var cascadeObj = new Cascade();

cascadeObj.define('config', null, config);

cascadeObj.derive('allowedSizes', ['config'], config => Object.keys(config));

cascadeObj.define('size', ['allowedSizes'], allowedSizes => Cascade.types.Enum(allowedSizes));

cascadeObj.derive('allowedColors', ['size', 'config'], (size, config) => Object.keys(config[size]));

cascadeObj.define('color', ['allowedColors'], allowedColors => Cascade.types.Enum(allowedColors), null, 'Red');

test('test wait data', () => {
	var mockFn = jest.fn();
    cascadeObj.subscribe(mockFn);
    
	var waitFun = jest.fn().mockImplementation((allowedColors, size, color) => {
		cascadeObj.setState('color', 'Green');
	});
	cascadeObj.wait(['allowedColors', 'size', 'color'], waitFun);
	
	expect(waitFun).toHaveBeenCalledTimes(1);
	expect(waitFun).lastCalledWith(['Green', 'Red'], 'S', 'Red');
    
	expect(mockFn).toHaveBeenCalledTimes(1);
	expect(mockFn).lastCalledWith({
		color : 'Green'
	});
	
	//ensure waitFun only run once
	cascadeObj.setState('size', 'M');
	expect(waitFun).toHaveBeenCalledTimes(1);
	expect(mockFn).toHaveBeenCalledTimes(2);
});