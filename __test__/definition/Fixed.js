var Cascade = require('../../dist/cascade');

var cascadeObj = new Cascade();


test('expect testFixed to be 123', () => {

	cascadeObj.define('testFixed', null, 123);
	expect(cascadeObj.getState('testFixed')).toBe(123);
	
	cascadeObj.setState('testFixed', 234);
	expect(cascadeObj.getState('testFixed')).toBe(123);
});
