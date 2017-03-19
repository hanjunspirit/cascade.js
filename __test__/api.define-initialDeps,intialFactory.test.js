var Cascade = require('..');
var config  = require('./config');

jest.useFakeTimers();

var cascadeObj = new Cascade();

test('define state with a plain default value', () => {
	var cascadeObj = new Cascade();
	cascadeObj.define('size', null, () => Cascade.types.Enum(['S', 'M']), null, 'M');
	expect(cascadeObj.getState('size')).toBe('M');
});

test('define state with a computed default value', () => {
	var cascadeObj = new Cascade();
	cascadeObj.define('urlParams', null, {
		size : 'M'
	});
	cascadeObj.define('size', null, () => Cascade.types.Enum(['S', 'M']), ['urlParams'], urlParams => urlParams.size);
	expect(cascadeObj.getState('size')).toBe('M');
});

test('define state with an async computed default value', () => {
	var cascadeObj = new Cascade();
	cascadeObj.define('urlParams', null, {
		size : 'M'
	});
	
	cascadeObj.derive('sizeFromUrl', ['urlParams'], urlParams => Cascade.Promise(resolve => {
        setTimeout(() => {
            resolve(urlParams.size);
        }, 1000);
    }));
    
	cascadeObj.define('size', null, () => Cascade.types.Enum(['S', 'M']), ['sizeFromUrl'], sizeFromUrl => sizeFromUrl);
	expect(cascadeObj.getState('size')).toBe(null);
	jest.runAllTimers();
	
	expect(cascadeObj.getState('size')).toBe('M');
});

test('define an async state with an async default value', () => {
	var cascadeObj = new Cascade();
	cascadeObj.define('config', null, config);
	
	cascadeObj.derive('allowedSizes', ['config'], config => Cascade.Promise(resolve => {
        setTimeout(() => {
            resolve(Object.keys(config));
        }, 2000);
    }));
    
    cascadeObj.define('urlParams', null, {
		size : 'M'
	});
	
	cascadeObj.derive('sizeFromUrl', ['urlParams'], urlParams => Cascade.Promise(resolve => {
        setTimeout(() => {
            resolve(urlParams.size);
        }, 1000);
    }));
    
	cascadeObj.define('size', ['allowedSizes'], (allowedSizes) => Cascade.types.Enum(allowedSizes), ['sizeFromUrl'], sizeFromUrl => sizeFromUrl);
	expect(cascadeObj.getState('size')).toBe(null);
	cascadeObj.wait(['size'], size => {
		expect('size').toBe('aa');;
	});
	
	jest.runAllTimers();
	
	
	expect(cascadeObj.getState('size')).toBe('M');
});