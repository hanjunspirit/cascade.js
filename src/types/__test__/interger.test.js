var Interger = require('../Interger');

describe('Interger', () => {
	//intial
	test('test intial', () => {
		var obj = Interger(1, 10);
		//if the value is smaller than min
		expect(obj.setter(-1, undefined)).toBe(1);
		
		//if the value is bigger than max
		expect(obj.setter(55, undefined)).toBe(10);
		
		//if the value is normal
		expect(obj.setter(5, undefined)).toBe(5);
		
		//if the value is not number
		expect(obj.setter('abc', undefined)).toBe(1);
	});
	
	
	test('test setValue', () => {
		var obj = Interger(1, 10);
		//if the value is smaller than min
		expect(obj.setter(-1, 6)).toBe(1);
		
		//if the value is bigger than max
		expect(obj.setter(55, 6)).toBe(10);
		
		//if the value is normal
		expect(obj.setter(5, 6)).toBe(5);
		
		//if the value is not number
		expect(obj.setter('abc', 6)).toBe(6);
	});
});

