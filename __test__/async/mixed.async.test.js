var Cascade = require('../..');
var config = require('../config');

jest.useFakeTimers();

var cascadeObj = new Cascade();

cascadeObj.define('config', null, config);

cascadeObj.derive('allowedSizes', ['config'], config => Object.keys(config));

cascadeObj.define('urlParams', null, {
	color : 'Black',
	size : 'M'
});

cascadeObj.derive('colorFromUrl', ['urlParams'], urlParams => Cascade.async(resolve => {
    setTimeout(() => {
        resolve(urlParams.color);
    }, 1000);
}));

cascadeObj.derive('sizeFromUrl', ['urlParams'], urlParams => Cascade.async(resolve => {
    setTimeout(() => {
        resolve(urlParams.size);
    }, 1500);
}));

cascadeObj.define('size', ['allowedSizes'], allowedSizes => Cascade.types.Enum(allowedSizes), ['sizeFromUrl'], sizeFromUrl => sizeFromUrl);

cascadeObj.derive('allowedColors', ['size', 'config'], (size, config) => {
    return Cascade.async(resolve => {
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
			color : 'Black',
			size : 'M'
		},
        config,
        allowedSizes : ['S', 'M'],
        sizeFromUrl : null,
        size : null,
        colorFromUrl : null,
        allowedColors : null,
        color : null
    });
});

test('test wait async data', () => {
	var waitFun = jest.fn().mockImplementation((size, color) => {
		cascadeObj.setState('color', 'White');
	});
	cascadeObj.wait(['size', 'color'], waitFun);
	
	var mockFn = jest.fn();
    cascadeObj.subscribe(mockFn);
	
	jest.runAllTimers();
	expect(waitFun).toHaveBeenCalledTimes(1);
	expect(waitFun).lastCalledWith('M', 'Black');
    
	expect(mockFn).toHaveBeenCalledTimes(3);
    expect(mockFn).toHaveBeenCalledWith({
    	colorFromUrl : 'Black',
    	color : null
    });
    
    expect(mockFn).toHaveBeenCalledWith({
    	sizeFromUrl : 'M',
    	size : 'M',
    	allowedColors : null,
    	color : null
    });
    
	expect(mockFn).lastCalledWith({
		allowedColors : ['White', 'Black'],
		color : 'White'
	});
});