var Cascade = require('..');
jest.useFakeTimers();

test('test async derived data', () => {
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
    
    var allowedColorsFactory = jest.fn().mockImplementation((size, config) => {
        return Cascade.Promise(resolve => {
            setTimeout(() => {
                resolve(Object.keys(config[size]));
            }, 1000);
        });
    });
    cascadeObj.derive('allowedColors', ['size', 'config'], allowedColorsFactory);
    
    cascadeObj.define('color', ['allowedColors'], (allowedColors) => {
        return Cascade.types.Enum(allowedColors);
    }, null, 'Red');
    
    //size = S
    //color = Red
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
        allowedColors : null,
        size : 'S',
        color : null
    });
    
    var mockFn = jest.fn();
    
    cascadeObj.subscribe(mockFn);
    
    jest.runAllTimers();
	expect(allowedColorsFactory).toHaveBeenCalledTimes(1);
	expect(allowedColorsFactory).lastCalledWith('S', {
        S : {
            Green : 5,
            Red : 6
        },
        M : {
            White : 13,
            Black : 15
        }
    });
	
	expect(mockFn).toHaveBeenCalledTimes(1);
	
	//size = S
	//color = Red
	expect(mockFn).lastCalledWith({
        allowedColors : ['Green', 'Red'],
        color : 'Red'
    });
    
    cascadeObj.setState('size', 'M');
    
    //size = M
	//color = White
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).lastCalledWith({
    	size : 'M',
        allowedColors : null,
        color : null
    });
    
    jest.runAllTimers();
    
    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(mockFn).lastCalledWith({
        allowedColors : ['White', 'Black'],
        color : 'White'
    });
    
    cascadeObj.setState('size', 'S');
    var waitFun = jest.fn().mockImplementation((allowedColors, size, color) => {
    	cascadeObj.setState('color', 'Red');
    });
    cascadeObj.wait(['allowedColors', 'size', 'color'], waitFun);
    
    expect(waitFun).toHaveBeenCalledTimes(0);
    
    jest.runAllTimers();
    expect(waitFun).toHaveBeenCalledTimes(1);
    expect(waitFun).lastCalledWith(['Green', 'Red'], 'S', 'Green');
    
    expect(mockFn).toHaveBeenCalledTimes(5);
    expect(mockFn).lastCalledWith({
        allowedColors : ['Green', 'Red'],
        color : 'Red'
    });
});



