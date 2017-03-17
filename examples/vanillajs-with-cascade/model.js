'use strict';
var Cascade = require('../../src/cascade');
var Ingerger = require('../../src/types/interger');

var cascadeObj = module.exports = new Cascade();

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

cascadeObj.derive('allowedColors', ['config', 'size'], (config, size) => Object.keys(config[size]));

cascadeObj.define('color', ['allowedColors'], allowedColors => {
	return Cascade.types.Enum(allowedColors);
});

cascadeObj.derive('stock', ['config', 'size', 'color'], (config, size, color) => config[size][color]);

cascadeObj.define('quantity', ['stock'], stock => {
	return Ingerger(1, stock);
});

