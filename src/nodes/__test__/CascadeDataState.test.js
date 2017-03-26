var CascadeDataState = require('../CascadeDataState');

describe('CascadeDataState', () => {
	var factory = () => {};
	var initialFactory = () => {};
	test('should throw if name is empty', () => {
		expect(() => {
			new CascadeDataState('', ['deps1', 'deps2'], factory);
		}).toThrowError('The [name] param of define api is invalid');
	});
	
	test('allow deps is empty', () => {
		var myNode = new CascadeDataState('myName', null, factory);
		expect(myNode.deps).toEqual([]);
	});
	
	test('should throw if factory is undefined', () => {
		expect(() => {
			new CascadeDataState('myName', ['deps1', 'deps2'], undefined);
		}).toThrowError('The [factory] param of define("myName", ...) api is invalid');
	});
	
	test('allow factory is not a function', () => {
		var myNode = new CascadeDataState('myName', ['deps1', 'deps2'], 'abc');
		expect(myNode.factory).toBe('abc');
	});
	
	test('allow initialDeps is empty', () => {
		var myNode = new CascadeDataState('myName', ['deps1', 'deps2'], 'abc', null, 'bcd');
		expect(myNode.initialDeps).toEqual([]);
	});
	
	test('allow initialFactory is not a function', () => {
		var myNode = new CascadeDataState('myName', ['deps1', 'deps2'], 'abc', null, 'bcd');
		expect(myNode.initialFactory).toBe('bcd');
	});
	
	var myNode = new CascadeDataState('myName', ['deps1', 'deps2'], factory, ['deps3', 'deps4'], initialFactory);
	test('test constructor', () => {
		expect(myNode.name).toBe('myName');
		expect(myNode.deps).toEqual(['deps1', 'deps2']);
		expect(myNode.factory).toBe(factory);
		expect(myNode.initialDeps).toEqual(['deps3', 'deps4']);
		expect(myNode.initialFactory).toBe(initialFactory);
		
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