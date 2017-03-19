var Cascade = require('..');
var Interger = require('../dist/types/interger');
var config = require('./config');

var cascadeObj = new Cascade();
	
cascadeObj.define('config', null, config);

cascadeObj.derive('allowedSizes', ['config'], config => Object.keys(config));

cascadeObj.define('size', ['allowedSizes'], allowedSizes => Cascade.types.Enum(allowedSizes));

cascadeObj.derive('allowedColors', ['config', 'size'], (config, size) => Object.keys(config[size]));

cascadeObj.define('color', ['allowedColors'], allowedColors => Cascade.types.Enum(allowedColors));

cascadeObj.derive('stock', ['config', 'size', 'color'], (config, size, color) => config[size][color]);

cascadeObj.define('quantity', ['stock'], stock => {
	return Interger(1, stock);
});

//whether the name of the state is corrent 
test('test define api [name]', () => {
	expect(cascadeObj.getState('size')).toBe('S');
	expect(cascadeObj.getState('allowedColors')).toEqual(['Green', 'Red']);
	expect(cascadeObj.getState('quantity')).toBe(1);
});


test('test define api [deps]', () => {
	cascadeObj.setState('quantity', 100);
	expect(cascadeObj.getState('quantity')).toBe(5);
});