var Cascade = require('..');

var cascadeObj = new Cascade();
var config = require('./config');

cascadeObj.define('config', null, config);

//derive allowedSizes
var allowedSizesFactory = jest.fn().mockImplementation(config => Object.keys(config));

cascadeObj.derive('allowedSizes', ['config'], allowedSizesFactory);

//define size
var sizeFactory = jest.fn().mockImplementation(allowedSizes => Cascade.types.Enum(allowedSizes));

cascadeObj.define('size', ['allowedSizes'], sizeFactory);

//derive allowedColors
var allowedColorsFactory = jest.fn().mockImplementation((size, config) => Object.keys(config[size]));

cascadeObj.derive('allowedColors', ['size', 'config'], allowedColorsFactory);

//define color
var colorFactory = jest.fn().mockImplementation(allowedColors => Cascade.types.Enum(allowedColors));

cascadeObj.define('color', ['allowedColors'], colorFactory);


test('on initial time, test define factory', () => {
    //expect sizeFactory
    expect(sizeFactory).toHaveBeenCalledTimes(1);
	expect(sizeFactory).lastCalledWith(['S', 'M']);
	
    //expect colorFactory
    expect(colorFactory).toHaveBeenCalledTimes(1);
    expect(colorFactory).lastCalledWith(['Green', 'Red']);
});

test('on initial time, test derive factory', () => {
	//expect allowedSizesFactory
    expect(allowedSizesFactory).toHaveBeenCalledTimes(1);
	expect(allowedSizesFactory).lastCalledWith(config);
	
	//expect allowedColorsFactory
	expect(allowedColorsFactory).toHaveBeenCalledTimes(1);
	expect(allowedColorsFactory).lastCalledWith('S', config);
});

test('setState with on change, test nothing happened', () => {
    //no change
    cascadeObj.setState('size', 'S');
    expect(allowedSizesFactory).toHaveBeenCalledTimes(1);
    expect(sizeFactory).toHaveBeenCalledTimes(1);
    expect(allowedColorsFactory).toHaveBeenCalledTimes(1);
    expect(colorFactory).toHaveBeenCalledTimes(1);
});

test('setState with changes, test define/derive factory', () => {
	//set size to M
    //allowedColors,color will change
    cascadeObj.setState('size', 'M');
    expect(allowedSizesFactory).toHaveBeenCalledTimes(1);
    expect(sizeFactory).toHaveBeenCalledTimes(1);
    
    expect(colorFactory).toHaveBeenCalledTimes(2);
    expect(colorFactory).lastCalledWith(['White', 'Black']);
    
    expect(allowedColorsFactory).toHaveBeenCalledTimes(2);
    expect(allowedColorsFactory).lastCalledWith('M', config);
    
});