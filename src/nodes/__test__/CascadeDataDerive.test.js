var CascadeDataDerive = require('../CascadeDataDerive');

describe('CascadeDataDerive', () => {
	var factory = () => {};
	test('should throw if name is empty', () => {
		expect(() => {
			new CascadeDataDerive('', ['deps1', 'deps2'], factory);
		}).toThrowError('The [name] param of derive api is invalid');
	});
	
	test('should throw if deps is empty', () => {
		expect(() => {
			new CascadeDataDerive('myName', [], factory);
		}).toThrowError('The [deps] param of derive("myName", ...) api should not be empty');
	});
	
	test('should throw if factory is not a function', () => {
		expect(() => {
			new CascadeDataDerive('myName', ['deps1', 'deps2'], 'abc');
		}).toThrowError('The [factory] param of derive("myName", ...) api should be a function');
	});
	
	var myNode = new CascadeDataDerive('myName', ['deps1', 'deps2'], factory);
	
	test('test constructor', () => {
		expect(myNode.name).toBe('myName');
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