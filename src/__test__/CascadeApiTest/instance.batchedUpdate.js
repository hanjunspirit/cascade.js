var Cascade = require('../../Cascade');
describe('Cascade instance batchedUpdate', () => {
	var obj;
	var fnToSubscribe;
	
	beforeEach(() => {
		obj = new Cascade();
		
		obj.define('state1', null, () => Cascade.types.Any(), null, 555);
		obj.define('state2', null, () => Cascade.types.Any(), null, 666);
		obj.define('state3', null, () => Cascade.types.Any(), null, 777);
		
		fnToSubscribe = jest.fn();
		obj.subscribe(fnToSubscribe);
		
		fnToSubscribe2 = jest.fn();
		obj.subscribe(fnToSubscribe2);
	});
	
	test('should not trigger subscribes if none of states is updated', () => {
		obj.batchedUpdate(() => {});
		expect(fnToSubscribe).toHaveBeenCalledTimes(0);
		expect(fnToSubscribe2).toHaveBeenCalledTimes(0);
	});
	
	test('normal', () => {
		obj.batchedUpdate(() => {
			obj.setState('state1', 777)
			obj.setState('state2', 999)
		});
		
		expect(fnToSubscribe).toHaveBeenCalledTimes(1);
		expect(fnToSubscribe2).toHaveBeenCalledTimes(1);
		expect(fnToSubscribe).lastCalledWith({
			state1 : 777,
			state2 : 999
		});
		expect(fnToSubscribe2).lastCalledWith({
			state1 : 777,
			state2 : 999
		});
		
		expect(obj.updatedStates).toEqual({});
	});
	
	test('allow nesting', () => {
		obj.batchedUpdate(() => {
			obj.setState('state1', 777)
			obj.batchedUpdate(() => {
				obj.setState('state2', 999)
			});
		});
		
		expect(fnToSubscribe).toHaveBeenCalledTimes(1);
		expect(fnToSubscribe2).toHaveBeenCalledTimes(1);
		expect(fnToSubscribe).lastCalledWith({
			state1 : 777,
			state2 : 999
		});
		expect(fnToSubscribe2).lastCalledWith({
			state1 : 777,
			state2 : 999
		});
		
		expect(obj.updatedStates).toEqual({});
	});
});
