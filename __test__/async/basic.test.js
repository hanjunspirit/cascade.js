var Cascade = require('../..');
var config = require('../config');

jest.useFakeTimers();

var cascadeObj = new Cascade();

cascadeObj.define('config', null, config);

cascadeObj.derive('allowedSizes', ['config'], config => Object.keys(config));

cascadeObj.define('size', ['allowedSizes'], allowedSizes => Cascade.types.Enum(allowedSizes));


var allowedColorsFactory = jest.fn().mockImplementation((size, config) => {
    return Cascade.Promise(resolve => {
        setTimeout(() => {
            resolve(Object.keys(config[size]));
        }, 1000);
    });
});
cascadeObj.derive('allowedColors', ['size', 'config'], allowedColorsFactory);

cascadeObj.define('color', ['allowedColors'], allowedColors => Cascade.types.Enum(allowedColors), null, 'Red');

//intial
test('test initial async derived data', () => {
    //size = S
    //color = Red
    //quantity = 1
    expect(cascadeObj.getStates()).toEqual({
        config,
        allowedSizes : ['S', 'M'],
        allowedColors : null,
        size : 'S',
        color : null
    });
});


test('test async derived data ready', () => {
	var waitFun = jest.fn().mockImplementation((allowedColors, size, color) => {
		cascadeObj.setState('color', 'Black');
	});
	cascadeObj.wait(['allowedColors'], waitFun);
	
	var mockFn = jest.fn();
    cascadeObj.subscribe(mockFn);
    
    jest.runAllTimers();
	expect(allowedColorsFactory).toHaveBeenCalledTimes(1);
	expect(allowedColorsFactory).lastCalledWith('S', config);
	
	expect(waitFun).toHaveBeenCalledTimes(1);
	expect(waitFun).lastCalledWith(['Green', 'Red']);
	
	expect(mockFn).toHaveBeenCalledTimes(1);
	
	//size = S
	//color = Red
	expect(mockFn).lastCalledWith({
        allowedColors : ['Green', 'Red'],
        color : 'Red'
    });
    
    cascadeObj.unsubscribe(mockFn);
});

test('test set state to lead to async derived data', () => {
	var mockFn = jest.fn();
    
    cascadeObj.subscribe(mockFn);
    
    var waitFun = jest.fn().mockImplementation((allowedColors, size, color) => {
		cascadeObj.setState('color', 'Black');
	});
    
	cascadeObj.setState('size', 'M');
	
	cascadeObj.wait(['allowedColors'], waitFun);
    
    //size = M
	//color = White
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).lastCalledWith({
    	size : 'M',
        allowedColors : null,
        color : null
    });
    
    jest.runAllTimers();
    
    expect(waitFun).toHaveBeenCalledTimes(1);
	expect(waitFun).lastCalledWith(['White', 'Black']);
    
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).lastCalledWith({
        allowedColors : ['White', 'Black'],
        color : 'Black'
    });
    
    cascadeObj.unsubscribe(mockFn);
});


