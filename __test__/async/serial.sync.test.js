var Cascade = require('../..');
var config = require('../config');

jest.useFakeTimers();

var cascadeObj = new Cascade();

cascadeObj.define('config', null, config);

cascadeObj.derive('allowedSizes', ['config'], config => Object.keys(config));

cascadeObj.define('urlParams', null, {
	size : 'M'
});

var sizeFromUrlFactory = jest.fn().mockImplementation(urlParams => Cascade.Promise(resolve => {
    setTimeout(() => {
        resolve(urlParams.size);
    }, 1500);
}))
cascadeObj.derive('sizeFromUrl', ['urlParams'], sizeFromUrlFactory);

cascadeObj.define('size', ['allowedSizes'], allowedSizes => Cascade.types.Enum(allowedSizes), ['sizeFromUrl'], sizeFromUrl => sizeFromUrl);

var allowedColorsFactory = jest.fn().mockImplementation((size, config) => Cascade.Promise(resolve => {
    setTimeout(() => {
        resolve(Object.keys(config[size]));
    }, 2000);
}));

cascadeObj.derive('allowedColors', ['size', 'config'], allowedColorsFactory);

cascadeObj.define('color', ['allowedColors'], allowedColors => Cascade.types.Enum(allowedColors), null, 'Red');

//intial
test('test initial async derived data', () => {
    //size = S
    //color = Red
    //quantity = 1
    expect(cascadeObj.getStates()).toEqual({
    	urlParams : {
			size : 'M'
		},
        config,
        allowedSizes : ['S', 'M'],
        size : null,
        sizeFromUrl : null,
        allowedColors : null,
        color : null
    });
});

test('test wait async data', () => {
	var waitFun = jest.fn().mockImplementation((allowedColors, size, color) => {
		cascadeObj.setState('color', 'Black');
	});
	cascadeObj.wait(['allowedColors', 'size', 'color'], waitFun);
	
	var mockFn = jest.fn();
    cascadeObj.subscribe(mockFn);
	
	jest.runAllTimers();
	expect(waitFun).toHaveBeenCalledTimes(1);
	expect(waitFun).lastCalledWith(['White', 'Black'], 'M', 'White');
    
	expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith({
    	sizeFromUrl : 'M',
    	size : 'M',
    	allowedColors : null,
    	color : null
    });
	expect(mockFn).lastCalledWith({
		allowedColors : ['White', 'Black'],
		color : 'Black'
	});
	
	//expect(sizeFromUrlFactory).toHaveBeenCalledTimes(1);
	//expect(allowedColorsFactory).toHaveBeenCalledTimes(1);
});