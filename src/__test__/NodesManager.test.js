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
	test('test initial', () => {
		var obj = new testFn();
		expect(obj.statesObj).toEqual({});
		expect(obj.impactGraph).toEqual({});
	});
});

describe('some Exceptions', () => {
	var obj;
	beforeEach(() => {
		obj = new testFn();
	});
	describe('NodesManager addNode Exception', () => {
		
		test('should throw if add deps of undefined name', () => {
			//CascadeDataState with deps
			expect(() => {
				obj.addNode(new CascadeDataState('state1', ['state2'], () => {}));
			}).toThrowError('The dependency [state2] does not exist');
			
			//CascadeDataState with initialDeps
			expect(() => {
				obj.addNode(new CascadeDataState('state1', null, () => {}, ['state2'], 111));
			}).toThrowError('The dependency [state2] does not exist');
			
			//CascadeDataDerive
			expect(() => {
				obj.addNode(new CascadeDataDerive('derive1', ['state1'], () => {}));
			}).toThrowError('The dependency [state1] does not exist');
			
			//CascadeWait
			expect(() => {
				obj.addNode(new CascadeWait('__require__1', ['state1'], () => {}));
			}).toThrowError('The dependency [state1] does not exist');
		});
		
		test('should throw if define an existed name', () => {
			expect(() => {
				obj.addNode(new CascadeDataState('state1', null, () => {}));
				obj.addNode(new CascadeDataState('state1', null, () => {}));
			}).toThrowError('The state or drived data [state1] is already defined');
		});
	});
	
	describe('NodesManager removeNode Exception', () => {
		test('should throw if removeNode a none exist name', () => {
			expect(() => {
				obj.removeNode('state1');
			}).toThrowError('You can not removeNode [state1], because it does not exist');
		});
		
		test('should throw if removeNode a CascadeDataState', () => {
			expect(() => {
				obj.addNode(new CascadeDataState('state1', null, () => {}));
				obj.removeNode('state1');
			}).toThrowError('You can only remove CascadeWait object');
		});
		
		test('should throw if removeNode a CascadeDataDerive', () => {
			expect(() => {
				obj.addNode(new CascadeDataState('state1', null, () => {}));
				obj.addNode(new CascadeDataDerive('derive1', ['state1'], () => {}));
				obj.removeNode('derive1');
			}).toThrowError('You can only remove CascadeWait object');
		});
	});
	
	describe('NodesManager removeInitialDeps Exception', () => {
		
		test('should throw if removeInitialDeps a none exist name', () => {
			expect(() => {
				obj.removeInitialDeps('state1');
			}).toThrowError('You can not removeInitialDeps [state1], because it does not exist');
		});
		
		test('should throw if removeInitialDeps a CascadeWait', () => {
			expect(() => {
				obj.addNode(new CascadeDataState('state1', null, () => {}));
				obj.addNode(new CascadeWait('__require__1', ['state1'], () => {}));
				obj.removeInitialDeps('__require__1');
			}).toThrowError('You can only remove initialDeps of a CascadeDataState object');
		});
		
		test('should throw if removeInitialDeps a CascadeDataDerive', () => {
			expect(() => {
				obj.addNode(new CascadeDataState('state1', null, () => {}));
				obj.addNode(new CascadeDataDerive('derive1', ['state1'], () => {}));
				obj.removeInitialDeps('derive1');
			}).toThrowError('You can only remove initialDeps of a CascadeDataState object');
		});
	});
});

describe('NodesManager', () => {
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
	
	test('test initial', () => {
		expect(obj.impactGraph).toEqual({});
		expect(obj.statesObj).toEqual({
			state1 : myNode1,
			state2 : myNode2,
			state3 : myNode3,
		});
	});
	
	describe('NodesManager addNode', () => {
		test('test add CascadeDataState with deps', () => {
			//test add state without initialDeps
			obj.addNode(new CascadeDataState('state4', ['state1', 'state2'], () => {}));
			
			expect(obj.impactGraph).toEqual({
				state1 : ['state4'],
				state2 : ['state4'],
			});
			
			obj.addNode(new CascadeDataDerive('derive5', ['state2', 'state3'], () => {}));
			expect(obj.impactGraph).toEqual({
				state1 : ['state4'],
				state2 : ['state4', 'derive5'],
				state3 : ['derive5']
			});
			
			obj.addNode(new CascadeWait('__require__6', ['derive5', 'state2'], () => {}));
			expect(obj.impactGraph).toEqual({
				state1 : ['state4'],
				state2 : ['state4', 'derive5', '__require__6'],
				state3 : ['derive5'],
				derive5 : ['__require__6']
			});
		});
		
		test('test add CascadeDataState with deps and intialDeps', () => {
			//test add state without initialDeps
			obj.addNode(new CascadeDataState('state4', ['state1'], () => {}, ['state3'], () => {}));
			
			expect(obj.impactGraph).toEqual({
				state1 : ['state4'],
				state3 : ['state4'],
			});
			
			//deps and intialDeps have some same deps
			obj.addNode(new CascadeDataState('state5', ['state2', 'state3'], () => {}, ['state1', 'state2'], () => {}));
			expect(obj.impactGraph).toEqual({
				state1 : ['state4', 'state5'],
				state2 : ['state5'],
				state3 : ['state4', 'state5']
			});
			
			expect(obj.statesObj['state5'].initialDeps).toEqual(['state1', 'state2']);
		});
	});
	
	describe('NodesManager removeNode', () => {
		test('test add/remove CascadeWait', () => {
			//test add
			obj.addNode(new CascadeWait('__require__4', ['state1', 'state2'], () => {}));
			
			obj.addNode(new CascadeDataState('state5', ['state1'], () => {}, ['state3'], () => {}));
			
			expect(obj.impactGraph).toEqual({
				state1 : ['__require__4', 'state5'],
				state2 : ['__require__4'],
				state3 : ['state5']
			});
			
			//test remove
			obj.removeNode('__require__4');
			expect(obj.impactGraph).toEqual({
				state1 : ['state5'],
				state2 : [],
				state3 : ['state5']
			});
			
			expect(obj.statesObj['__require__4']).toBe(undefined);
		});
	});
	
	describe('NodesManager removeInitialDeps', () => {
		test('test remove CascadeDataState simple initialDeps', () => {
			//test remove initialDeps
			obj.addNode(new CascadeDataState('state4', ['state1'], () => {}, ['state3'], () => {}));
			obj.addNode(new CascadeDataDerive('derive5', ['state2', 'state3'], () => {}));
			
			obj.removeInitialDeps('state4');
			expect(obj.impactGraph).toEqual({
				state1 : ['state4'],
				state2 : ['derive5'],
				state3 : ['derive5'],
			});
			expect(obj.statesObj['state4'].initialDeps).toBe(undefined);
			expect(obj.statesObj['state4'].initialFactory).toBe(undefined);
		});
		
		test('test remove CascadeDataState complex initialDeps', () => {
			//test remove initialDeps
			var myNode4 = new CascadeDataState('state4', ['state1', 'state2'], () => {}, ['state2', 'state3'], () => {});
			obj.addNode(myNode4);
			
			obj.removeInitialDeps('state4');
			expect(obj.impactGraph).toEqual({
				state1 : ['state4'],
				state2 : ['state4'],
				state3 : [],
			});
			
			expect(obj.statesObj['state4']).toBe(myNode4);
			expect(myNode4.initialDeps).toBe(undefined);
			expect(myNode4.initialFactory).toBe(undefined);
		});
	});
	
	describe('NodesManager getChildren', () => {
		test('test getChildren with deps', () => {
			//test add state without initialDeps
			obj.addNode(new CascadeDataState('state4', ['state1', 'state2'], () => {}));
			
			expect(obj.getChildren('state1')).toEqual(['state4']);
			expect(obj.getChildren('state3')).toEqual([]);
			
			obj.addNode(new CascadeDataState('state5', ['state2', 'state3'], () => {}));
			expect(obj.getChildren('state2')).toEqual(['state4', 'state5']);
			
			obj.addNode(new CascadeDataState('state6', ['state5'], () => {}));
			expect(obj.getChildren('state2')).toEqual(['state4', 'state5', 'state6']);
		});
		
		test('test getChildren with intialDeps', () => {
			//test add state without initialDeps
			obj.addNode(new CascadeDataState('state4', ['state1'], () => {}, ['state3'], () => {}));
			
			//deps and intialDeps have some same deps
			obj.addNode(new CascadeDataState('state5', ['state2', 'state3'], () => {}, ['state1', 'state2'], () => {}));
			
			expect(obj.getChildren('state1')).toEqual(['state4', 'state5']);
			expect(obj.getChildren('state2')).toEqual(['state5']);
			expect(obj.getChildren('state3')).toEqual(['state4', 'state5']);
			
			obj.removeInitialDeps('state4');
			expect(obj.getChildren('state3')).toEqual(['state5']);
		});
	});
});
