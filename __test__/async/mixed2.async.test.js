var Cascade = require('../..');
var config = require('../config');

jest.useFakeTimers();

var cascadeObj = new Cascade();

cascadeObj.define('config', null, config);

cascadeObj.derive('allowedSizes', ['config'], config => Object.keys(config));

cascadeObj.define('urlParams', null, () => Cascade.types.Any(), null, {
	color : 'Black',
	size : 'M'
});

var colorFromUrlFactory = jest.fn().mockImplementation(urlParams => Cascade.async(resolve => {
    setTimeout(() => {
        resolve(urlParams.color);
    }, 1000);
}));
cascadeObj.derive('colorFromUrl', ['urlParams'], colorFromUrlFactory);

var sizeFromUrlFactory = jest.fn().mockImplementation(urlParams => Cascade.async(resolve => {
    setTimeout(() => {
        resolve(urlParams.size);
    }, 1500);
}))
cascadeObj.derive('sizeFromUrl', ['urlParams'], sizeFromUrlFactory);

cascadeObj.define('size', ['allowedSizes'], allowedSizes => Cascade.types.Enum(allowedSizes), ['sizeFromUrl'], sizeFromUrl => sizeFromUrl);

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

//when pending setState
test('test wait async data', () => {
	var waitFun = jest.fn().mockImplementation((colorFromUrl) => {
		cascadeObj.setState('urlParams', {
			color : 'Red',
			size : 'S'
		});
	});
	cascadeObj.wait(['colorFromUrl'], waitFun);
	
	var mockFn = jest.fn();
    cascadeObj.subscribe(mockFn);
	
	jest.runAllTimers();
	expect(waitFun).toHaveBeenCalledTimes(1);
	expect(waitFun).lastCalledWith('Black');
    
	expect(mockFn).toHaveBeenCalledTimes(4);
	
    expect(mockFn).toHaveBeenCalledWith({
    	urlParams : {
    		color : 'Red',
			size : 'S'
    	},
    	colorFromUrl : null,
    	sizeFromUrl : null,
    	color : null,
    	size : null,
    	allowedColors : null
    });
    
    expect(mockFn).toHaveBeenCalledWith({
    	colorFromUrl : 'Red',
    	color : null
    });
    
    expect(mockFn).toHaveBeenCalledWith({
    	sizeFromUrl : 'S',
    	size : 'S',
    	allowedColors : null,
    	color : null
    });
    
	expect(mockFn).lastCalledWith({
		allowedColors : ['Green', 'Red'],
		color : 'Red'
	});
	
	expect(colorFromUrlFactory).toHaveBeenCalledTimes(2);
	expect(sizeFromUrlFactory).toHaveBeenCalledTimes(2);
	expect(allowedColorsFactory).toHaveBeenCalledTimes(1);
});