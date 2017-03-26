var util = require('../util');

describe('util', () => {
	test('test util.error', () => {
		expect(() => {
			util.error("abc");
		}).toThrowError('abc');
	});
	
	test('test util.arrayForEach', () => {
		var arr = ['a', 2, 3];
		var callback = jest.fn();
		util.arrayForEach(arr, callback);
		
		expect(callback).toHaveBeenCalledTimes(3);
		expect(callback).toHaveBeenCalledWith('a', 0);
		expect(callback).toHaveBeenCalledWith(2, 1);
		expect(callback).lastCalledWith(3, 2);
	});
	
	test('test util.arraySome', () => {
		var arr = ['a', 'b', 2, 3];
		var callback = jest.fn().mockImplementation(value => value === 2);
		var res = util.arraySome(arr, callback);
		
		expect(res).toBe(true);
		expect(callback).toHaveBeenCalledTimes(3);
		expect(callback).toHaveBeenCalledWith('a', 0);
		expect(callback).toHaveBeenCalledWith('b', 1);
		expect(callback).lastCalledWith(2, 2);
		
		var callback = jest.fn().mockImplementation(value => value === 555);
		var res = util.arraySome(arr, callback);
		
		expect(res).toBe(false);
		expect(callback).toHaveBeenCalledTimes(4);
		expect(callback).toHaveBeenCalledWith('a', 0);
		expect(callback).toHaveBeenCalledWith('b', 1);
		expect(callback).toHaveBeenCalledWith(2, 2);
		expect(callback).lastCalledWith(3, 3);
	});
	
	test('test util.arrayMap', () => {
		var arr = ['a', 2, 3];
		var callback = jest.fn().mockImplementation(value => value + 'abc');
		var res = util.arrayMap(arr, callback);
		expect(res).toEqual(['aabc', '2abc', '3abc']);
		expect(callback).toHaveBeenCalledTimes(3);
		expect(callback).toHaveBeenCalledWith('a', 0);
		expect(callback).toHaveBeenCalledWith(2, 1);
		expect(callback).lastCalledWith(3, 2);
	});
	
	test('test util.arrayIndexOf', () => {
		var arr = ['a', 'b', 2, 3];
		//test when find the result
		var res = util.arrayIndexOf(arr, 2);
		expect(res).toBe(2);
		
		//test dit not find the result
		var res = util.arrayIndexOf(arr, 555);
		
		expect(res).toBe(-1);
	});
	
	test('test util.arrayRemove', () => {
		var arr = ['a', 'b', 2, 3];
		
		util.arrayRemove(arr, 2);
		expect(arr).toEqual(['a', 'b', 3]);
		
		util.arrayRemove(arr, 555);
		expect(arr).toEqual(['a', 'b', 3]);
		
		var arr = [3];
		util.arrayRemove(arr, 3);
		expect(arr).toEqual([]);
	});
	
	test('test util.assign', () => {
		var base = {
			a : 'aaa',
			b : 'bbb',
			e : 'eee'
		};
		
		util.assign(base, {
			a : 'aaa2',
			c : 'ccc2',
			f : 'fff2'
		}, {
			b : 'bbb3',
			c : 'ccc3',
			d : 'ddd3'
		});
		
		expect(base).toEqual({
			a : 'aaa2',
			b : 'bbb3',
			c : 'ccc3',
			d : 'ddd3',
			e : 'eee',
			f : 'fff2'
		});
	});
	
	test('test util.extendClass', () => {
		var aFun = jest.fn();
		var bFun = jest.fn();
		var b_AFun = jest.fn();
		
		function a(){}
		a.prototype.aFun = aFun;
		
		function b(){}
		b.prototype.bFun = bFun;
		b.prototype.aFun = b_AFun;
		
		util.extendClass(b, a);
		
		
		expect(b.prototype.constructor === b);
		var bObj = new b();
		
		expect(bObj instanceof b).toBe(true);
		
		bObj.bFun();
		expect(bFun).toHaveBeenCalledTimes(1);
		bObj.aFun();
		expect(aFun).toHaveBeenCalledTimes(0);
		expect(b_AFun).toHaveBeenCalledTimes(1);
	});
});
