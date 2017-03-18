var Cascade = require('../dist/cascade');
var Interger = require('../dist/types/interger');

var cascadeObj = new Cascade();

cascadeObj.define('config', null, {
	S : {
		Green : 5,
		Red : 6
	},
	M : {
		White : 13,
		Black : 15
	}
});

cascadeObj.derive('allowedSizes', ['config'], config => Object.keys(config));

cascadeObj.define('size', ['allowedSizes'], allowedSizes => {
	return Cascade.types.Enum(allowedSizes);
});

cascadeObj.derive('allowedColors', ['config', 'size'], (config, size) => Object.keys(config[size]));

cascadeObj.define('color', ['allowedColors'], allowedColors => {
	return Cascade.types.Enum(allowedColors);
});

cascadeObj.derive('stock', ['config', 'size', 'color'], (config, size, color) => config[size][color]);

cascadeObj.define('quantity', ['stock'], stock => {
	return Interger(1, stock);
});


test('test getStates', () => {
	//size = S
	//color = Green
	//quantity = 1
	expect(cascadeObj.getStates()).toEqual({
		config : {
			S : {
				Green : 5,
				Red : 6
			},
			M : {
				White : 13,
				Black : 15
			}
		},
		allowedSizes : ['S', 'M'],
		allowedColors : ['Green', 'Red'],
		stock : 5,
		size : 'S',
		color : 'Green',
		quantity : 1
	});
	
	var mockFn = jest.fn();
	
	cascadeObj.subscribe(mockFn);
	
	cascadeObj.setState('color', 'Black');
	expect(mockFn).toHaveBeenCalledTimes(0);
	
	cascadeObj.setState('color', 'Red');
	expect(mockFn).toHaveBeenCalledTimes(1);
	
	//size = S
	//color = Red
	//quantity = 1
	expect(mockFn).lastCalledWith({
		color : 'Red',
		quantity : 1,
		stock : 6
	});
	
	cascadeObj.setState('size', 'M');
	expect(mockFn).toHaveBeenCalledTimes(2);
	
	//size = M
	//color = White
	//quantity = 1
	expect(mockFn).lastCalledWith({
		allowedColors : ['White', 'Black'],
		stock : 13,
		size : 'M',
		color : 'White',
		quantity : 1
	});
	
	cascadeObj.batchedUpdate(() => {
		cascadeObj.setState('size', 'S');
		cascadeObj.setState('color', 'Red');
		cascadeObj.setState('quantity', 3);
	});
	
	expect(mockFn).toHaveBeenCalledTimes(3);
	//size = S
	//color = Red
	//quantity = 3
	expect(mockFn).lastCalledWith({
		allowedColors : ['Green', 'Red'],
		stock : 6,
		size : 'S',
		color : 'Red',
		quantity : 3
	});
	
	/*
	cascadeObj.define('newProp', null, 55);
	expect(mockFn).toHaveBeenCalledTimes(4);
	expect(mockFn).lastCalledWith({
		newProp : 55
	});
	*/
});
