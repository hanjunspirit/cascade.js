var Cascade = require('../../dist/cascade');
var Interger = require('../../dist/types/interger');


test('test testIngerger', () => {
	var cascadeObj = new Cascade();
	cascadeObj.define('testIngerger', null, () => Interger(-2, 10));
	expect(cascadeObj.getState('testIngerger')).toBe(-2);
	
	cascadeObj.setState('testIngerger', 100);
	expect(cascadeObj.getState('testIngerger')).toBe(10);
	
	cascadeObj.setState('testIngerger', -100);
	expect(cascadeObj.getState('testIngerger')).toBe(-2);
	
	cascadeObj.setState('testIngerger', '100');
	expect(cascadeObj.getState('testIngerger')).toBe(-2);
});

test('expect testEnum2 default value to be 5', () => {
	var cascadeObj = new Cascade();
	cascadeObj.define('testIngerger', null, () => Interger(-2, 10), null, 5);
	expect(cascadeObj.getState('testIngerger')).toBe(5);
});

test('expect testEnum2 default value to be 10', () => {
	var cascadeObj = new Cascade();
	cascadeObj.define('testIngerger', null, () => Interger(-2, 10), null, 100);
	expect(cascadeObj.getState('testIngerger')).toBe(10);
});
