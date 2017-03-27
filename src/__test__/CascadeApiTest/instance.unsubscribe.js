var Cascade = require('../../Cascade');
describe('Cascade instance unsubscribe', () => {
	test('test', () => {
		var obj = new Cascade();
		
		var fnToSubscribe1 = () => {};
		var fnToSubscribe2 = () => {};
		obj.subscribe(fnToSubscribe1);
		obj.subscribe(fnToSubscribe2);
		
		obj.unsubscribe(fnToSubscribe1);
		expect(obj.subscribers.length).toBe(1);
		expect(obj.subscribers).toEqual([fnToSubscribe2]);
	});
});
