var Cascade = require('../../Cascade');
jest.useFakeTimers();

describe('Cascade instance getState', () => {
	var obj;
	var fnToSubscribe;
	
	beforeEach(() => {
		obj = new Cascade();
		
		obj.define('state1', null, () => Cascade.types.Any(), null, 555);
		obj.define('state2', null, () => Cascade.types.Any(), null, 666);
		obj.define('state3', null, () => Cascade.types.Any(), null, 777);
		obj.derive('derive4', ['state2'], (state2) => state2 + "aaa");
		obj.derive('derive5', ['state1'], (state1) => Cascade.async(resolve => {
			setTimeout(() => {
				resolve(state1 + "aaa")
			}, 1000)
		}));
		obj.define('state6', ['derive5'], (derive5) => Cascade.types.Fixed(derive5 + 'bbb'));
		
		fnToSubscribe = jest.fn();
		obj.subscribe(fnToSubscribe);
	});
	
	test('getState a none existed name, will return null', () => {
		expect(obj.getState('xxxxx')).toBe(null);
	});
	
	test('getState a state', () => {
		expect(obj.getState('state1')).toBe(555);
	});
	
	test('getState a derived data', () => {
		expect(obj.getState('derive4')).toBe("666aaa");
	});
	
	test('getState a pending derived data', () => {
		expect(obj.getState('derive5')).toBe(null);
		jest.runAllTimers();
		expect(obj.getState('derive5')).toBe('555aaa');
	});
	
	test('getState a pending state', () => {
		expect(obj.getState('state6')).toBe(null);
		jest.runAllTimers();
		expect(obj.getState('state6')).toBe('555aaabbb');
	});
});
