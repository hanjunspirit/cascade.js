var Cascade = require('../../dist/cascade');

test('test testFixed default value', () => {
	var cascadeObj = new Cascade();

	cascadeObj.define('testFixed', null, 123);
	expect(cascadeObj.getState('testFixed')).toBe(123);
	
	cascadeObj.setState('testFixed', 234);
	expect(cascadeObj.getState('testFixed')).toBe(123);
});


test('test testFixed default value with Cascade.types.Fixed', () => {
	var cascadeObj = new Cascade();

	cascadeObj.define('testFixed', null, () => Cascade.types.Fixed(123));
	expect(cascadeObj.getState('testFixed')).toBe(123);
	
	cascadeObj.setState('testFixed', 234);
	expect(cascadeObj.getState('testFixed')).toBe(123);
});


test('test testFixed default value with default value', () => {
	var cascadeObj = new Cascade();

	cascadeObj.define('testFixed', null, 123, null, 234);
	expect(cascadeObj.getState('testFixed')).toBe(123);
	
	cascadeObj.setState('testFixed', 234);
	expect(cascadeObj.getState('testFixed')).toBe(123);
});
