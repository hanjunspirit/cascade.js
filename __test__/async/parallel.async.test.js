var Cascade = require('../..');
var config = require('../config');

jest.useFakeTimers();

var cascadeObj = new Cascade();

cascadeObj.define('config', null, config);

cascadeObj.derive('allowedSizes', ['config'], config => Object.keys(config));

cascadeObj.define('urlParams', null, {
	color : 'Red'
});

cascadeObj.derive('colorFromUrl', ['urlParams'], urlParams => Cascade.Promise(resolve => {
    setTimeout(() => {
        resolve(urlParams.color);
    }, 1000);
}));

cascadeObj.define('size', ['allowedSizes'], allowedSizes => Cascade.types.Enum(allowedSizes));

cascadeObj.derive('allowedColors', ['size', 'config'], (size, config) => {
    return Cascade.Promise(resolve => {
        setTimeout(() => {
            resolve(Object.keys(config[size]));
        }, 2000);
    });
});

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
});