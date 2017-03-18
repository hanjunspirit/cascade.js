var Cascade = require('../../dist/cascade');


test('expect testEnum', () => {
	var cascadeObj = new Cascade();
	cascadeObj.define('testEnum', null, () => Cascade.types.Enum(['a', 'b', 'c', 'd']));
	expect(cascadeObj.getState('testEnum')).toBe('a');
	
	cascadeObj.setState('testEnum', 'c');
	expect(cascadeObj.getState('testEnum')).toBe('c');
	
	cascadeObj.setState('testEnum', 'e');
	expect(cascadeObj.getState('testEnum')).toBe('c');
});

test('expect testEnum default value to be "b"', () => {
	var cascadeObj = new Cascade();
	cascadeObj.define('testEnum', null, () => Cascade.types.Enum(['a', 'b', 'c', 'd']), null, 'b');
	expect(cascadeObj.getState('testEnum')).toBe('b');
});

test('expect testEnum default value to be "a"', () => {
	var cascadeObj = new Cascade();
	cascadeObj.define('testEnum', null, () => Cascade.types.Enum(['a', 'b', 'c', 'd']), null, 'e');
	expect(cascadeObj.getState('testEnum')).toBe('a');
});
