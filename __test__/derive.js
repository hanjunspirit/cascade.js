var Cascade = require('..');

test('test derived data', () => {
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
    
    
    
    //expect allowedSizesFactory
    expect(allowedSizesFactory).toHaveBeenCalledTimes(1);
	expect(allowedSizesFactory).lastCalledWith({
        S : {
            Green : 5,
            Red : 6
        },
        M : {
            White : 13,
            Black : 15
        }
    });
    
    //expect sizeFactory
    expect(sizeFactory).toHaveBeenCalledTimes(1);
	expect(sizeFactory).lastCalledWith(['S', 'M']);
	
	
	//expect allowedColorsFactory
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
    
    //expect colorFactory
    expect(colorFactory).toHaveBeenCalledTimes(1);
    expect(colorFactory).lastCalledWith(['Green', 'Red']);
    
});