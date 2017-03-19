var Cascade = require('../../dist/cascade');

var cascadeObj = new Cascade();

test('expect testAny to be undefined', () => {
	cascadeObj.define('testAny', null, () => Cascade.types.Any());
	expect(cascadeObj.getState('testAny')).toBeUndefined();
});

test('expect testAny to be "any value"', () => {
	cascadeObj.setState('testAny', 'any value');
	expect(cascadeObj.getState('testAny')).toBe('any value');
});

test('expect testAny to be "default value"', () => {
	cascadeObj.define('testAnyWithDefaultValue', null, () => Cascade.types.Any(), null, 'default value');
	expect(cascadeObj.getState('testAnyWithDefaultValue')).toBe('default value');
});
