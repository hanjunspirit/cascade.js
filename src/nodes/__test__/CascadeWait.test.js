var CascadeWait = require('../CascadeWait');

describe('CascadeWait', () => {
	var factory = () => {};
	test('should throw if deps is empty', () => {
		expect(() => {
			var waitNode = new CascadeWait('__require__1', [], factory);
		}).toThrowError('The [deps] param of wait api should not be empty');
	});
	
	var myNode = new CascadeWait('__require__1', ['deps1', 'deps2'], factory);
	
	test('test constructor', () => {
		expect(myNode.name).toBe('__require__1');
		expect(myNode.deps).toEqual(['deps1', 'deps2']);
		expect(myNode.factory).toBe(factory);
		
		expect(myNode.isDirty()).toBe(true);
	});
	
	test('test status convertion', () => {
		//from dirty to pending
		myNode.setPending();
		expect(myNode.isPending()).toBe(true);
		
		//can't from pending to clean
		myNode.setClean();
		expect(myNode.isPending()).toBe(true);
		
		//from pending to dirty
		myNode.setDirty();
		expect(myNode.isDirty()).toBe(true);
		
		//from dirty to clean
		myNode.setClean();
		expect(myNode.isClean()).toBe(true);
		
		//can't from clean to pending
		myNode.setPending();
		expect(myNode.isClean()).toBe(true);
	});
});