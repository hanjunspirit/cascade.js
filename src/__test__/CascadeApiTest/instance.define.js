var Cascade = require('../../Cascade');
jest.useFakeTimers();

describe('Cascade instance define', () => {
	var obj
	beforeEach(() => {
		obj = new Cascade();
	});
	
	test('should throw if factory returns an invalid definition', () => {
		expect(() => {
			obj.define('state1', null, () => '111');
		}).toThrowError('Invalid definition was returned in state [state1]');
	});
	
	describe('sync mode', () => {
		describe('basic usage', () => {
			test('allow facotry is not function', () => {
				obj.define('state1', null, 111);
				expect(obj.getState('state1')).toBe(111);
			});
			
			test('allow facotry is function', () => {
				obj.define('state1', null, () => Cascade.types.Enum([222, 333]));
				expect(obj.getState('state1')).toBe(222);
			});
			
			test('allow initialFacotry is not function', () => {
				obj.define('state1', null, () => Cascade.types.Any(), null, 555);
				expect(obj.getState('state1')).toBe(555);
			});
			
			test('allow initialFacotry is function', () => {
				obj.define('state1', null, () => Cascade.types.Any(), null, () => 555);
				expect(obj.getState('state1')).toBe(555);
			});
		});
		
		test('ensure that the statesObj/states are defined correctly', () => {
			obj.define('state1', null, () => Cascade.types.Any(), null, 555);
			obj.define('state2', null, () => Cascade.types.Any(), null, 666);
			obj.define('state3', null, 777);
			
			expect(Object.keys(obj.statesObj).length).toBe(3);
			expect(obj.states).toEqual({
				state1 : 555,
				state2 : 666,
				state3 : 777
			});
		});
		
		describe('ensure factory is excuted correctly', () => {
			test('no deps', () => {
				var state1Factory = jest.fn().mockImplementation(() => Cascade.types.Any());
				obj.define('state1', null, state1Factory, null, 555);
				
				expect(state1Factory).toHaveBeenCalledTimes(1);
				expect(state1Factory).lastCalledWith();
			});
			
			test('with deps', () => {
				obj.define('state1', null, () => Cascade.types.Any(), null, 555);
				obj.define('state2', null, () => Cascade.types.Any(), null, 666);
				
				var state3Factory = jest.fn().mockImplementation((state1, state2) => Cascade.types.Enum([state1, state2]));
				obj.define('state3', ['state1', 'state2'], state3Factory);
				
				expect(state3Factory).toHaveBeenCalledTimes(1);
				expect(state3Factory).lastCalledWith(555, 666);
			});
		});
		
		describe('ensure initialFactory is excuted correctly', () => {
			test('no deps', () => {
				var state1initialFactory = jest.fn().mockImplementation(() => 555);
				obj.define('state1', null, () => Cascade.types.Any(), null, state1initialFactory);
				
				expect(state1initialFactory).toHaveBeenCalledTimes(1);
				expect(state1initialFactory).lastCalledWith();
			});
			
			test('with deps', () => {
				obj.define('state1', null, () => Cascade.types.Any(), null, 555);
				obj.derive('derive2', ['state1'], (state1) => state1 + 111);
				
				var state3initialFactory = jest.fn().mockImplementation((state1, state2) => state1 + state2);
				obj.define('state3', null, () => Cascade.types.Any(), ['state1', 'derive2'], state3initialFactory);
				
				expect(state3initialFactory).toHaveBeenCalledTimes(1);
				expect(state3initialFactory).lastCalledWith(555, 666);
			});
		});
		
		test('ensure that the define could trigger the subscribers', () => {
			fnToSubscribe = jest.fn();
			obj.subscribe(fnToSubscribe);
			
			obj.define('state1', null, () => Cascade.types.Any(), null, 555);
			
			expect(fnToSubscribe).toHaveBeenCalledTimes(1);
			expect(fnToSubscribe).lastCalledWith({
				state1 : 555,
			});
			
			obj.define('state2', null, () => Cascade.types.Any(), null, 666);
			expect(fnToSubscribe).toHaveBeenCalledTimes(2);
			expect(fnToSubscribe).lastCalledWith({
				state2 : 666
			});
		});
		
		test('ensure removeInitialDeps', () => {
			obj.removeInitialDeps = jest.fn().mockImplementation(obj.removeInitialDeps);
			obj.define('state1', null, () => Cascade.types.Any(), null, 555);
			
			expect(obj.removeInitialDeps).toHaveBeenCalledTimes(1);
			expect(obj.removeInitialDeps).lastCalledWith('state1');
		});
		
		test('ensure the status', () => {
			obj.define('state1', null, () => Cascade.types.Any(), null, 555);
			expect(obj.statesObj['state1'].isClean()).toBe(true);
		});
	});
	
	describe('async mode', () => {
		
		var state3Factory;
		var state4InitialFactory;
		var fnToSubscribe;
		
		beforeEach(() => {
			state3Factory = jest.fn().mockImplementation((derive2) => Cascade.types.Fixed(derive2 + 'bbb'));
			state4InitialFactory = jest.fn().mockImplementation((derive2) => derive2 + 'ccc');
			fnToSubscribe = jest.fn();
			
			obj.define('state1', null, () => Cascade.types.Any(), null, 555);
			obj.derive('derive2', ['state1'], (state1) => Cascade.async(resolve => {
				setTimeout(() => {
					resolve(state1 + "aaa")
				}, 1000)
			}));
			obj.subscribe(fnToSubscribe);
			obj.removeInitialDeps = jest.fn().mockImplementation(obj.removeInitialDeps);
			
			obj.define('state3', ['derive2'], state3Factory);
			obj.define('state4', null, () => Cascade.types.Any(), ['derive2'], state4InitialFactory);
		});
		
		describe('basic usage', () => {
			test('allow deps contain async node', () => {
				expect(obj.getState('state3')).toBe(null);
				jest.runAllTimers();
				expect(obj.getState('state3')).toBe("555aaabbb");
			});
			
			test('allow initialDeps contain async node', () => {
				expect(obj.getState('state4')).toBe(null);
				jest.runAllTimers();
				expect(obj.getState('state4')).toBe("555aaaccc");
			});
		});
		
		test('ensure factory is excuted correctly', () => {
			expect(state3Factory).toHaveBeenCalledTimes(0);
			jest.runAllTimers();
			expect(state3Factory).toHaveBeenCalledTimes(1);
			expect(state3Factory).lastCalledWith("555aaa");
		});
		
		test('ensure initialFactory is excuted correctly', () => {
			expect(state4InitialFactory).toHaveBeenCalledTimes(0);
			jest.runAllTimers();
			expect(state4InitialFactory).toHaveBeenCalledTimes(1);
			expect(state4InitialFactory).lastCalledWith("555aaa");
		});
		
		test('ensure that the define could trigger the subscribers', () => {
			expect(fnToSubscribe).toHaveBeenCalledTimes(2);
			expect(fnToSubscribe).toHaveBeenCalledWith({
				state3 : null
			});
			expect(fnToSubscribe).lastCalledWith({
				state4 : null
			});
			jest.runAllTimers();
			expect(fnToSubscribe).toHaveBeenCalledTimes(3);
			expect(fnToSubscribe).lastCalledWith({
				derive2 : "555aaa",
				state3 : '555aaabbb',
				state4 : '555aaaccc'
			});
		});
		
		test('ensure removeInitialDeps', () => {
			expect(obj.removeInitialDeps).toHaveBeenCalledTimes(0);
			jest.runAllTimers();
			expect(obj.removeInitialDeps).toHaveBeenCalledTimes(1);
			expect(obj.removeInitialDeps).lastCalledWith('state4');
		});
		
		test('ensure the status', () => {
			expect(obj.statesObj['state3'].isPending()).toBe(true);
			expect(obj.statesObj['state4'].isPending()).toBe(true);
			jest.runAllTimers();
			expect(obj.statesObj['state3'].isClean()).toBe(true);
			expect(obj.statesObj['state4'].isClean()).toBe(true);
		});
	});
});
