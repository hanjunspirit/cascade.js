var util = require('../helper/util');
var NodesManager = require('../NodesManager');

var CascadeDataState = require('../nodes/CascadeDataState');
var CascadeDataDerive = require('../nodes/CascadeDataDerive');
var CascadeWait = require('../nodes/CascadeWait');

function testFn(){
	this.reinitializeNodesManager();
}
util.assign(testFn.prototype, NodesManager.Mixin);

describe('NodesManager intial', () => {
	
	test('should throw if add deps of undefined name', () => {
		expect(() => {
			var obj = new testFn();
			var myNode1 = new CascadeDataState('state1', ['state2'], () => {});
			obj.addNode(myNode1);
		}).toThrowError('The dependency [state2] does not exist');
	});
	
	test('should throw if define an existed name', () => {
		expect(() => {
			var obj = new testFn();
			var myNode1 = new CascadeDataState('state1', null, () => {});
			var myNode2 = new CascadeDataState('state1', null, () => {});
			
			obj.addNode(myNode1);
			obj.addNode(myNode2);
			
		}).toThrowError('The state or drived data [state1] is already defined');
	});
	
	test('test initial', () => {
		var obj = new testFn();
		expect(obj.statesObj).toEqual({});
		expect(obj.impactGraph).toEqual({});
	});
});

describe('NodesManager add CascadeDataState', () => {
	var obj;
	var myNode1;
	var myNode2;
	var myNode3;
	beforeEach(() => {
		obj = new testFn();
		myNode1 = new CascadeDataState('state1', null, () => {});
		myNode2 = new CascadeDataState('state2', null, () => {});
		myNode3 = new CascadeDataState('state3', null, () => {});
		obj.addNode(myNode1);
		obj.addNode(myNode2);
		obj.addNode(myNode3);
	});
	
	test('test add CascadeDataState with deps', () => {
		expect(obj.impactGraph).toEqual({});
		//test add state without initialDeps
		var myNode4 = new CascadeDataState('state4', ['state1', 'state2'], () => {});
		obj.addNode(myNode4);
		
		expect(obj.impactGraph).toEqual({
			state1 : ['state4'],
			state2 : ['state4'],
		});
		
		var myNode5 = new CascadeDataState('state5', ['state2', 'state3'], () => {});
		obj.addNode(myNode5);
		expect(obj.impactGraph).toEqual({
			state1 : ['state4'],
			state2 : ['state4', 'state5'],
			state3 : ['state5']
		});
		
		expect(obj.statesObj).toEqual({
			state1 : myNode1,
			state2 : myNode2,
			state3 : myNode3,
			state4 : myNode4,
			state5 : myNode5,
		});
	});
	
	test('test add CascadeDataState with deps and intialDeps', () => {
		//test add state without initialDeps
		var myNode4 = new CascadeDataState('state4', ['state1'], () => {}, ['state3'], () => {});
		obj.addNode(myNode4);
		
		expect(obj.impactGraph).toEqual({
			state1 : ['state4'],
			state3 : ['state4'],
		});
		
		//deps and intialDeps have some same deps
		var myNode5 = new CascadeDataState('state5', ['state2', 'state3'], () => {}, ['state1', 'state2'], () => {});
		obj.addNode(myNode5);
		expect(obj.impactGraph).toEqual({
			state1 : ['state4', 'state5'],
			state2 : ['state5'],
			state3 : ['state4', 'state5']
		});
		
		expect(myNode5.initialDeps).toEqual(['state1', 'state2']);
	});
	
	test('test remove CascadeDataState simple initialDeps', () => {
		//test remove initialDeps
		var myNode4 = new CascadeDataState('state4', ['state1'], () => {}, ['state3'], () => {});
		obj.addNode(myNode4);
		
		obj.removeInitialDeps(myNode4);
		expect(obj.impactGraph).toEqual({
			state1 : ['state4'],
			state3 : [],
		});
		expect(myNode4.initialDeps).toBe(undefined);
		expect(myNode4.initialFactory).toBe(undefined);
	});
	
	test('test remove CascadeDataState complex initialDeps', () => {
		//test remove initialDeps
		var myNode4 = new CascadeDataState('state4', ['state1', 'state2'], () => {}, ['state2', 'state3'], () => {});
		obj.addNode(myNode4);
		
		obj.removeInitialDeps(myNode4);
		expect(obj.impactGraph).toEqual({
			state1 : ['state4'],
			state2 : ['state4'],
			state3 : [],
		});
		
		expect(obj.statesObj['state4']).toBe(myNode4);
		expect(myNode4.initialDeps).toBe(undefined);
		expect(myNode4.initialFactory).toBe(undefined);
	});
	
	test('test add/remove CascadeWait', () => {
		//test add
		var myNode4 = new CascadeWait('__require__1', ['state1', 'state2'], () => {});
		obj.addNode(myNode4);
		
		expect(obj.impactGraph).toEqual({
			state1 : ['__require__1'],
			state2 : ['__require__1']
		});
		
		//test remove
		obj.removeNode(myNode4);
		expect(obj.impactGraph).toEqual({
			state1 : [],
			state2 : []
		});
		
		expect(obj.statesObj['__require__1']).toBe(undefined);
	});
	
	test('test getChildren with deps', () => {
		//test add state without initialDeps
		var myNode4 = new CascadeDataState('state4', ['state1', 'state2'], () => {});
		obj.addNode(myNode4);
		
		expect(obj.getChildren('state1')).toEqual(['state4']);
		expect(obj.getChildren('state3')).toEqual([]);
		
		var myNode5 = new CascadeDataState('state5', ['state2', 'state3'], () => {});
		obj.addNode(myNode5);
		expect(obj.getChildren('state2')).toEqual(['state4', 'state5']);
		
		var myNode6 = new CascadeDataState('state6', ['state5'], () => {});
		obj.addNode(myNode6);
		expect(obj.getChildren('state2')).toEqual(['state4', 'state5', 'state6']);
	});
	
	test('test getChildren with intialDeps', () => {
		//test add state without initialDeps
		var myNode4 = new CascadeDataState('state4', ['state1'], () => {}, ['state3'], () => {});
		obj.addNode(myNode4);
		
		//deps and intialDeps have some same deps
		var myNode5 = new CascadeDataState('state5', ['state2', 'state3'], () => {}, ['state1', 'state2'], () => {});
		obj.addNode(myNode5);
		
		expect(obj.getChildren('state1')).toEqual(['state4', 'state5']);
		expect(obj.getChildren('state2')).toEqual(['state5']);
		expect(obj.getChildren('state3')).toEqual(['state4', 'state5']);
		
		obj.removeInitialDeps(myNode4);
		expect(obj.getChildren('state3')).toEqual(['state5']);
	});
});
