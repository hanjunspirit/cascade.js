var Cascade = require('..');
var config = require('./config');

jest.useFakeTimers();

var cascadeObj = new Cascade();

cascadeObj.define('config', null, config);

cascadeObj.derive('allowedSizes', ['config'], config => Object.keys(config));

cascadeObj.define('size', ['allowedSizes'], allowedSizes => Cascade.types.Enum(allowedSizes));

var allowedColorsFactory = jest.fn().mockImplementationOnce((size, config) => {
    return Cascade.Promise(resolve => {
        setTimeout(() => {
            resolve(Object.keys(config[size]));
        }, 1000);
    });
}).mockImplementation((size, config) => {
    return Cascade.Promise(resolve => {
        setTimeout(() => {
            resolve(Object.keys(config[size]).concat('Yellow'));
        }, 1000);
    });
});
cascadeObj.derive('allowedColors', ['size', 'config'], allowedColorsFactory);

cascadeObj.define('color', ['allowedColors'], allowedColors => Cascade.types.Enum(allowedColors), null, 'Red');

test('test forceUpdate derived data', () => {
	var waitFun = jest.fn().mockImplementation((allowedColors, size, color) => {
		setTimeout(() => {
			cascadeObj.forceUpdate('allowedColors');
		}, 1000);
	});
	cascadeObj.wait(['allowedColors'], waitFun);
	
	var mockFn = jest.fn();
	cascadeObj.subscribe(mockFn);
	
	jest.runAllTimers();
	expect(allowedColorsFactory).toHaveBeenCalledTimes(2);
	expect(allowedColorsFactory).lastCalledWith('S', config);
	
	expect(mockFn).toHaveBeenCalledTimes(2);
	
	expect(mockFn).lastCalledWith({
		allowedColors : ['Green', 'Red', 'Yellow'],
		color : 'Red'
	});
});