var uglyPromise = require('../UglyPromise');

jest.useFakeTimers();

describe('UglyPromise', () => {
	//if the callback is synchronous, the intial status will be Resolved
	test('when the callback is synchronous', () => {
		var obj = new uglyPromise(resolve => {
			resolve('This is result');
		});
		
		//Ensure the intial is Resolved, if the callback is synchronous
		expect(obj.status).toBe('Resolved');
		
		//When the status of UglyPromise is Resolved, the then call will be called synchronously
		var onThen = jest.fn();
			
		obj.then(onThen);
		
		expect(onThen).toHaveBeenCalledTimes(1);
		expect(onThen).lastCalledWith('This is result');
	});
	
	test('when the callback is asynchronous', () => {
		var obj = new uglyPromise(resolve => {
			setTimeout(() => {
				resolve('This is result');
			}, 1000);
		});
		
		//If the callback is asynchronous, the intial state is Pending
		expect(obj.status).toBe('Pending');
		
		var onThen = jest.fn();
		obj.then(onThen);
		
		var onThen2 = jest.fn();
		obj.then(onThen2);
		
		expect(onThen).toHaveBeenCalledTimes(0);
		expect(onThen2).toHaveBeenCalledTimes(0);
		
		jest.runAllTimers();
		expect(onThen).toHaveBeenCalledTimes(1);
		expect(onThen).lastCalledWith('This is result');
		
		expect(onThen2).toHaveBeenCalledTimes(1);
		expect(onThen2).lastCalledWith('This is result');
	});
});
