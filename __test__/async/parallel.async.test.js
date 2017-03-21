var Cascade = require('../..');
var config = require('../config');

jest.useFakeTimers();

var cascadeObj = new Cascade();

cascadeObj.define('config', null, config);

cascadeObj.derive('allowedSizes', ['config'], config => Object.keys(config));

cascadeObj.define('urlParams', null, {
	color : 'Red'
});

var colorFromUrlFactory = jest.fn().mockImplementation(urlParams => Cascade.async(resolve => {
    setTimeout(() => {
        resolve(urlParams.color);
    }, 1000);
}));
cascadeObj.derive('colorFromUrl', ['urlParams'], colorFromUrlFactory);

cascadeObj.define('size', ['allowedSizes'], allowedSizes => Cascade.types.Enum(allowedSizes));

var allowedColorsFactory = jest.fn().mockImplementation((size, config) => Cascade.async(resolve => {
    setTimeout(() => {
        resolve(Object.keys(config[size]));
    }, 2000);
}));
cascadeObj.derive('allowedColors', ['size', 'config'], allowedColorsFactory);

cascadeObj.define('color', ['allowedColors'], allowedColors => Cascade.types.Enum(allowedColors), ['colorFromUrl'], colorFromUrl => colorFromUrl);

//intial
test('test initial async derived data', () => {
    //size = S
    //color = Red
    //quantity = 1
    expect(cascadeObj.getStates()).toEqual({
    	urlParams : {
			color : 'Red'
		},
        config,
        allowedSizes : ['S', 'M'],
        size : 'S',
        colorFromUrl : null,
        allowedColors : null,
        color : null
    });
});

test('test wait async data', () => {
	var waitFun = jest.fn().mockImplementation((allowedColors, size, color) => {
		cascadeObj.setState('color', 'Green');
	});
	cascadeObj.wait(['allowedColors', 'size', 'color'], waitFun);
	
	var mockFn = jest.fn();
    cascadeObj.subscribe(mockFn);
	
	jest.runAllTimers();
	expect(waitFun).toHaveBeenCalledTimes(1);
	expect(waitFun).lastCalledWith(['Green', 'Red'], 'S', 'Red');
    
	expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith({
    	colorFromUrl : 'Red',
    	color : null
    });
	expect(mockFn).lastCalledWith({
		allowedColors : ['Green', 'Red'],
		color : 'Green'
	});
	
	expect(colorFromUrlFactory).toHaveBeenCalledTimes(1);
	expect(allowedColorsFactory).toHaveBeenCalledTimes(1);
});