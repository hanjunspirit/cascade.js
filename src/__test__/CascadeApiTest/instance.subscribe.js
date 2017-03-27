var Cascade = require('../../Cascade');
describe('Cascade instance subscribe', () => {
	test('test', () => {
		var obj = new Cascade();
		
		var fnToSubscribe1 = () => {};
		var fnToSubscribe2 = () => {};
		obj.subscribe(fnToSubscribe1);
		obj.subscribe(fnToSubscribe2);
		
		expect(obj.subscribers.length).toBe(2);
		expect(obj.subscribers).toEqual([fnToSubscribe1, fnToSubscribe2]);
		
		obj.subscribe(fnToSubscribe1);
		expect(obj.subscribers.length).toBe(2);
		expect(obj.subscribers).toEqual([fnToSubscribe1, fnToSubscribe2]);
	});
});
